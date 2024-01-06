export interface WithLoggerOpts {
  logger: Logger;
}

export interface Logger {
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  log: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
}

export function createConsoleLogger(): Logger {
  return console;
}

type DummyLogger = Logger & { logs: unknown[] };

export function createDummyLogger(): DummyLogger {
  return {
    logs: [],
    debug(...message: unknown[]) {
      this.logs.push(...message);
    },
    info(...message: unknown[]) {
      this.logs.push(...message);
    },
    log(...message: unknown[]) {
      this.logs.push(...message);
    },
    warn(...message: unknown[]) {
      this.logs.push(...message);
    },
    error(...message: unknown[]) {
      this.logs.push(...message);
    },
  };
}
