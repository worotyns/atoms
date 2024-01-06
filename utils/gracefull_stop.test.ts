import { assertEquals } from 'asserts';
import { GracefullStop } from './gracefull_stop.ts';
import { Logger } from './logger.ts';

Deno.test('utils/gracefull_stop.test.ts', async () => {
  type DummyLogger = Logger & { logs: unknown[] };

  const dummyLogger: DummyLogger = {
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

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const gracefullStop = GracefullStop.create(dummyLogger, {
    exitAfterStop: false,
  });

  gracefullStop
    .register(async () => {
      await delay(5);
      return 'first dummy process stopped';
    })
    .register(async () => {
      await delay(5);
      return 'second dummy process stopped';
    });

  await gracefullStop.stop();

  assertEquals(dummyLogger.logs, [
    'stop() called',
    'Stopping process...',
    'Calling abortController to send signal to all tasks',
    'Task done: first dummy process stopped',
    'Task done: second dummy process stopped',
  ]);

  gracefullStop.unregister();
});
