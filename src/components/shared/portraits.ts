export const PORTRAIT_POOL: string[] = Array.from(
  { length: 16 },
  (_, i) => `/portraits/p${String(i + 1).padStart(2, "0")}.jpg`,
);

export const portrait = (index: number) =>
  PORTRAIT_POOL[((index % PORTRAIT_POOL.length) + PORTRAIT_POOL.length) %
    PORTRAIT_POOL.length];
