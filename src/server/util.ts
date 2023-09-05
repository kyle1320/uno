export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class Timer {
  private timeout: ReturnType<typeof setTimeout> | null = null;
  private date: number | null = null;
  private callback: (() => void) | null = null;

  public set(date: number | null, cb: (() => void) | null = null) {
    this.callback = cb;

    if (this.date !== date) {
      this.date = date;
      this.tick();
    }
  }

  public cancel() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    this.date = null;
    this.callback = null;
  }

  private tick = () => {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    if (this.date == null) {
      return;
    }

    const now = Date.now();
    if (now >= this.date) {
      const cb = this.callback;
      this.date = null;
      this.callback = null;
      cb?.();
    } else {
      this.timeout = setTimeout(this.tick, this.date - now);
    }
  };
}
