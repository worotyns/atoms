import { assertEquals } from 'asserts';
import { createDummyLogger } from './logger.ts';
import { SelfPersist } from './self_persist.ts';
import { delay } from './delay.ts';

Deno.test('SelfPersist test', async () => {
  const logger = createDummyLogger();

  const sp = new SelfPersist(
    () => Promise.resolve(logger.log('persisting...')),
    10,
    5,
  );

  for (let i = 0; i < 10; i++) {
    await sp.touch();
  }
  assertEquals(logger.logs.length, 2);

  await delay(11);
  assertEquals(logger.logs.length, 3);

  sp.stop();
});
