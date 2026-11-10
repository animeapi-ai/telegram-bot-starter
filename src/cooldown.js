// Per-user cooldown, kept in memory. Good enough for one bot process.
const lastUse = new Map();
const inFlight = new Set();

/** @returns {number} seconds the user still has to wait (0 = go ahead) */
export function secondsLeft(userId, cooldownSeconds) {
  if (cooldownSeconds <= 0) return 0;
  const wait = (lastUse.get(userId) ?? 0) + cooldownSeconds * 1000 - Date.now();
  return wait > 0 ? Math.ceil(wait / 1000) : 0;
}

export const isBusy = (userId) => inFlight.has(userId);
export const start = (userId) => inFlight.add(userId);
export const finish = (userId, succeeded) => {
  inFlight.delete(userId);
  if (succeeded) lastUse.set(userId, Date.now());
};
