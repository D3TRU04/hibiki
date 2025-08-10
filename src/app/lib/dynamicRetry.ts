export function withRetry<T>(importer: () => Promise<T>, retries = 2, delayMs = 500): () => Promise<T> {
  return async function attempt(): Promise<T> {
    try {
      return await importer();
    } catch (err: unknown) {
      const msg = String((err as { message?: string })?.message ?? err);
      if (retries <= 0 || !/Loading chunk|ChunkLoadError|Failed to fetch dynamically imported module/i.test(msg)) {
        throw err;
      }
      await new Promise((r) => setTimeout(r, delayMs));
      return withRetry(importer, retries - 1, delayMs)();
    }
  };
} 