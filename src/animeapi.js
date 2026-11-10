// Small AnimeAPI client: one function, no dependencies. https://animeapi.ai/docs/api-reference

const API_URL = 'https://animeapi.ai/api/generate';

export class AnimeApiError extends Error {
  constructor(message, { status = 0, code = '' } = {}) {
    super(message);
    this.name = 'AnimeApiError';
    this.status = status;
    this.code = code;
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Generate one image. Retries once when AnimeAPI says a retry can succeed
 * (failed generations are refunded).
 * @returns {Promise<{image_url: string, enhanced_prompt: string, balance_usd: number, generation_time_ms: number}>}
 */
export async function generateImage({ apiKey, prompt, model = 'anime', orientation = 'portrait', enhance = true }) {
  for (let attempt = 1; ; attempt++) {
    let res;
    try {
      res = await fetch(API_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model, orientation, enhance }),
        signal: AbortSignal.timeout(120_000),
      });
    } catch (error) {
      throw new AnimeApiError(error.message, { code: 'NETWORK' });
    }
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.image_url) return data;

    const message = typeof data.error === 'string' ? data.error : data.error?.message ?? `HTTP ${res.status}`;
    const retryable = data.retryable === true || res.status === 500 || res.status === 503;
    if (retryable && attempt < 2) {
      await sleep(Math.min(Number(res.headers.get('retry-after')) || 3, 10) * 1000);
      continue;
    }
    throw new AnimeApiError(message, { status: res.status, code: data.code ?? '' });
  }
}

/** Download the finished image. AnimeAPI image URLs are not permanent storage. */
export async function downloadImage(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(60_000) });
  if (!res.ok) throw new Error(`Image download failed (HTTP ${res.status})`);
  const type = res.headers.get('content-type') ?? '';
  return { buffer: Buffer.from(await res.arrayBuffer()), extension: type.includes('png') ? 'png' : 'webp' };
}

/** A sentence a chat user can read, for every way a generation can fail. */
export function describeError(error) {
  if (!(error instanceof AnimeApiError)) return 'Something went wrong while drawing. Please try again.';
  if (error.status === 402) return 'This bot\'s image balance is empty. Bot owner: add funds at https://animeapi.ai/dashboard/billing (from $5, never expires).';
  if (error.status === 401) return 'This bot\'s AnimeAPI key was not accepted. Bot owner: check it at https://animeapi.ai/dashboard/api-keys';
  if (error.code === 'MODERATION_BLOCKED' || error.code === 'PROVIDER_REJECTED') return `The image was rejected: ${error.message}`;
  if (error.status === 503 || error.status === 429) return 'The image service is busy. Try again in a few seconds.';
  if (error.code === 'NETWORK') return 'Could not reach the image service. Try again in a moment.';
  return `Image generation failed: ${error.message}`;
}
