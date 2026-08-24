// A small, swappable logging seam. The UI never calls `console.*` directly
// — everything goes through this so the destination (console today; a
// remote error-reporting service later, if ever needed) is one thing to
// change, not scattered call sites.
export interface Logger {
  debug(message: string, ...details: unknown[]): void;
  info(message: string, ...details: unknown[]): void;
  warn(message: string, ...details: unknown[]): void;
  error(message: string, ...details: unknown[]): void;
}

class ConsoleLogger implements Logger {
  debug(message: string, ...details: unknown[]): void {
    console.debug(`[coolculator] ${message}`, ...details);
  }
  info(message: string, ...details: unknown[]): void {
    console.info(`[coolculator] ${message}`, ...details);
  }
  warn(message: string, ...details: unknown[]): void {
    console.warn(`[coolculator] ${message}`, ...details);
  }
  error(message: string, ...details: unknown[]): void {
    console.error(`[coolculator] ${message}`, ...details);
  }
}

export const logger: Logger = new ConsoleLogger();
