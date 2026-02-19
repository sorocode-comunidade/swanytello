/**
 * Patches console.log, console.warn, and console.error to prefix output with current time.
 * Import this once at application startup (e.g. in server.ts) so all terminal prints show when they ran.
 */

function timestamp(): string {
  return new Date().toISOString();
}

const originalLog = console.log.bind(console);
const originalWarn = console.warn.bind(console);
const originalError = console.error.bind(console);

console.log = (...args: unknown[]) => {
  originalLog(`[${timestamp()}]`, ...args);
};

console.warn = (...args: unknown[]) => {
  originalWarn(`[${timestamp()}]`, ...args);
};

console.error = (...args: unknown[]) => {
  originalError(`[${timestamp()}]`, ...args);
};
