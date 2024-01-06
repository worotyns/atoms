import { Logger } from './logger.ts';

export class SelfPersist {
  private changesCount = 0;
  private isPersistingNow = false;

  private lastPersisted: Date = new Date();

  private readonly interval: number;

  constructor(
    private readonly persist: () => Promise<void>,
    private readonly intervalMs: number,
    private readonly changesCalls: number,
  ) {
    this.interval = setInterval(async () => {
      if (this.isPersistingNow) {
        return;
      }

      const now = new Date();
      const diff = now.getTime() - this.lastPersisted.getTime();

      if (diff > this.intervalMs) {
        await this.internalPersist();
      }
    }, this.intervalMs);
  }

  private resetCounters() {
    this.lastPersisted = new Date();
    this.changesCount = 0;
  }

  public async touch() {
    this.changesCount++;
    if (this.changesCount >= this.changesCalls) {
      await this.internalPersist();
    }
  }

  private async internalPersist() {
    this.isPersistingNow = true;
    try {
      await this.persist();
    } catch (error) {
      throw error;
    } finally {
      this.isPersistingNow = false;
      this.resetCounters();
    }
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}
