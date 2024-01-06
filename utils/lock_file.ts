import { Path } from '../interfaces.ts';
import { WithLoggerOpts } from './logger.ts';

export class LockFile {
  constructor(
    private readonly path: Path,
    private readonly opts: WithLoggerOpts = { logger: console },
  ) {
    this.path = path + '.lock';
  }

  public getPath() {
    return this.path;
  }

  isLocked() {
    try {
      Deno.statSync(this.path);
      return true;
    } catch (error) {
      return false;
    }
  }

  lock() {
    Deno.writeFileSync(this.path, new Uint8Array(0));
  }

  unlock() {
    try {
      const res = Deno.statSync(this.path);
      if (res.isFile) {
        try {
          Deno.removeSync(this.path);
        } catch (error) {
          this.opts.logger.error('Cannot remove lock file', error);
          throw error;
        }
      }
    } catch (error) {
      this.opts.logger.error('Cannot stat lock file', error.message);
    }
  }
}
