import { assertEquals } from 'asserts';
import { GracefullStop } from './gracefull_stop.ts';
import { createDummyLogger, Logger } from './logger.ts';
import { delay } from './delay.ts';

Deno.test('utils/gracefull_stop.test.ts', async () => {
  const dummyLogger = createDummyLogger();

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
