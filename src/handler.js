import { generateImage, downloadImage, describeError } from './animeapi.js';
import { config, ORIENTATIONS } from './config.js';
import * as cooldown from './cooldown.js';

const USAGE = 'Tell me what to draw, for example:\n/anime a girl with a red umbrella at a rainy bus stop\n\nAdd a shape as the first word if you like: portrait, square or landscape.';

/** Reads "/anime [orientation] prompt" (also "/anime@YourBot ..."). Returns null for other messages. */
export function parseCommand(text) {
  const match = /^\/anime(?:@\w+)?(?:\s+([\s\S]*))?$/i.exec((text ?? '').trim());
  if (!match) return null;
  let prompt = (match[1] ?? '').trim();
  let orientation = config.orientation;
  const first = prompt.split(/\s+/, 1)[0]?.toLowerCase();
  if (ORIENTATIONS.includes(first) && prompt.length > first.length) {
    orientation = first;
    prompt = prompt.slice(first.length).trim();
  }
  return { prompt: prompt.slice(0, 1000), orientation };
}

/** Handles one incoming Telegram message. `telegram` is the object from createTelegram(). */
export async function handleMessage(message, telegram) {
  const command = parseCommand(message.text);
  if (!command) return;
  const chatId = message.chat.id;
  const replyTo = message.message_id;
  const userId = String(message.from?.id ?? chatId);

  if (!command.prompt) return telegram.sendMessage(chatId, USAGE, replyTo);
  if (!config.apiKey) {
    return telegram.sendMessage(chatId, 'This bot has no AnimeAPI key yet. Bot owner: set ANIMEAPI_KEY (get one at https://animeapi.ai/dashboard/api-keys).', replyTo);
  }
  if (cooldown.isBusy(userId)) return telegram.sendMessage(chatId, 'Your previous image is still being drawn.', replyTo);
  const wait = cooldown.secondsLeft(userId, config.cooldownSeconds);
  if (wait > 0) return telegram.sendMessage(chatId, `Please wait ${wait}s before generating another image.`, replyTo);

  cooldown.start(userId);
  let succeeded = false;
  try {
    await telegram.sendChatAction(chatId, 'upload_photo').catch(() => {});
    const result = await generateImage({
      apiKey: config.apiKey,
      prompt: command.prompt,
      model: config.model,
      orientation: command.orientation,
      allowNSFW: config.allowNSFW,
    });
    const image = await downloadImage(result.image_url);
    await telegram.sendPhoto(chatId, image.buffer, `anime.${image.extension}`, command.prompt, replyTo);
    succeeded = true;
    console.log(`image for ${userId} in ${result.generation_time_ms}ms, balance $${Number(result.balance_usd).toFixed(3)}`);
  } catch (error) {
    console.warn('generation failed:', error.status ?? '', error.code ?? '', error.message);
    await telegram.sendMessage(chatId, describeError(error), replyTo).catch(() => {});
  } finally {
    cooldown.finish(userId, succeeded);
  }
}
