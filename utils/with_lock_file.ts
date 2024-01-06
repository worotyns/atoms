import { LockFile } from './lock_file.ts';
import { WithLoggerOpts } from './logger.ts';
import { Path } from '../interfaces.ts';

export async function withLockFile(
  callback: () => Promise<void>,
  lockFilePath: Path,
  opts: WithLoggerOpts = { logger: console },
) {
  const lockFile = new LockFile(lockFilePath, opts);

  if (lockFile.isLocked()) {
    throw new Error(
      'Cannot run, lock file found - ' + lockFile.getPath(),
    );
  }

  lockFile.lock();
  await callback();
  lockFile.unlock();
}
