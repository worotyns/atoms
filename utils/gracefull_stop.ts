import { Logger } from './logger.ts';

interface GracefullStopOptions {
  // for test purposes
  exitAfterStop: boolean;
}

export class GracefullStop {
  static create(
    logger: Logger,
    options: Partial<GracefullStopOptions> = {},
  ): GracefullStop {
    return new GracefullStop(
      Deno,
      logger,
      Object.assign({}, {
        exitAfterStop: true,
      }, options),
    );
  }

  private stopping = false;

  private readonly stepsToDoOnExit: (() => Promise<string>)[] = [];
  private readonly abortController: AbortController = new AbortController();
  private readonly unlisten: Array<() => void> = [];

  get signal() {
    return this.abortController.signal;
  }

  constructor(
    private readonly process: typeof Deno,
    private readonly logger: Logger,
    private readonly options: GracefullStopOptions,
  ) {
    this.registerUncaughtExceptions();
    this.registerUnhandlerRejections();
    this.registerStopManager();
  }

  // for test purposes
  public unregister() {
    this.logger.info('unregister() called');

    while (this.stepsToDoOnExit.length) {
      this.stepsToDoOnExit.pop();
    }

    this.unlisten.forEach((unlisten) => unlisten());
  }

  private wrapWithTaskAndLog(type: string, callback: () => Promise<void>) {
    this.logger.warn('GracefullStop signal received:', type);
    return (error?: Error) => {
      if (error) {
        this.logger.error(type, error);
      }

      return callback();
    };
  }

  private registerUnhandlerRejections() {
    const listener = (event: PromiseRejectionEvent) => {
      this.wrapWithTaskAndLog(
        'unhandledRejection',
        () => this.stopProcess(),
      )(event.reason);
    };
    self.addEventListener('unhandledrejection', listener);
    this.unlisten.push(() =>
      self.removeEventListener('unhandledrejection', listener)
    );
  }

  private registerUncaughtExceptions() {
    const listener = (event: ErrorEvent) => {
      const error = event.error as Error;
      this.wrapWithTaskAndLog(
        'uncaughtException',
        () => this.stopProcess(),
      )(error);
    };

    self.addEventListener('error', listener);
    this.unlisten.push(() => self.removeEventListener('error', listener));
  }

  private registerStopManager() {
    const stopSignals: Deno.Signal[] = [
      'SIGTERM',
      'SIGINT',
      'SIGUSR2',
    ];

    stopSignals.forEach((signal) => {
      const listener = () => {
        this.wrapWithTaskAndLog(
          signal,
          () => this.stopProcess(),
        )();
      };
      Deno.addSignalListener(signal, listener);
      this.unlisten.push(() => Deno.removeSignalListener(signal, listener));
    });
  }

  private async stopProcess() {
    if (this.stopping) {
      this.logger.info('Already stopping process... wait');
      return;
    }

    this.logger.info('Stopping process...');
    this.logger.info('Calling abortController to send signal to all tasks');

    this.abortController.abort();

    for (const task of this.stepsToDoOnExit) {
      try {
        const resultMessage = await task();
        this.logger.info(`Task done: ${resultMessage}`);
      } catch (error) {
        this.logger.error(error);
        this.process.exit(1);
      }
    }

    if (this.options.exitAfterStop) {
      this.process.exit(0);
    }
  }

  public stop() {
    this.logger.info('stop() called');
    return this.stopProcess();
  }

  public register(fn: () => Promise<string>) {
    this.stepsToDoOnExit.push(fn);
    return this;
  }
}
