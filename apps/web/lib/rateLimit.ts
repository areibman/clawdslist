type RateState = {
  count: number;
  expiresAt: number;
};

const memory = new Map<string, RateState>();

export const rateLimit = (
  key: string,
  limit: number,
  windowMs: number
): { ok: boolean; remaining: number } => {
  const now = Date.now();
  const existing = memory.get(key);

  if (!existing || existing.expiresAt < now) {
    memory.set(key, { count: 1, expiresAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }

  if (existing.count >= limit) {
    return { ok: false, remaining: 0 };
  }

  existing.count += 1;
  memory.set(key, existing);
  return { ok: true, remaining: limit - existing.count };
};
