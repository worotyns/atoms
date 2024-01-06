export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function withDelay(callback: () => Promise<void>, ms: number) {
  await delay(ms);
  return callback();
}
