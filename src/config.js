const MODELS = ['anime', 'ultra', 'ultra-max'];
const ORIENTATIONS = ['portrait', 'square', 'landscape'];

function pick(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

export const config = {
  apiKey: process.env.ANIMEAPI_KEY ?? '',
  model: pick(process.env.ANIMEAPI_MODEL, MODELS, 'anime'),
  orientation: pick(process.env.ANIMEAPI_ORIENTATION, ORIENTATIONS, 'portrait'),
  cooldownSeconds: Number.isFinite(Number(process.env.COOLDOWN_SECONDS)) && process.env.COOLDOWN_SECONDS !== '' && process.env.COOLDOWN_SECONDS !== undefined
    ? Math.max(0, Number(process.env.COOLDOWN_SECONDS))
    : 30,
};

export { MODELS, ORIENTATIONS };
