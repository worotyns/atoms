import { assertRejects } from 'asserts';
import { delay } from './delay.ts';
import { createDummyLogger } from './logger.ts';
import { useLockFile } from './use_lock_file.ts';

Deno.test('useLockFile test', async () => {
  const lockFile = '/tmp/' + Math.random().toString(36).substring(7);

  const dummyLogger = createDummyLogger();

  const promise = useLockFile(
    async () => {
      await delay(10);
    },
    lockFile,
    { logger: dummyLogger },
  );

  assertRejects(() =>
    useLockFile(
      async () => {
        await delay(5);
      },
      lockFile,
      { logger: dummyLogger },
    ), 'Cannot run, lock file found - ' + lockFile);

  await promise;
});
