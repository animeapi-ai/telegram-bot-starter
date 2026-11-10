// AnimeAPI Telegram bot starter. Run: npm start
import { createTelegram } from './telegram.js';
import { handleMessage } from './handler.js';
import { config } from './config.js';

const token = process.env.TELEGRAM_TOKEN;
if (!token) {
  console.error('TELEGRAM_TOKEN is missing. Copy .env.example to .env and fill it in.');
  process.exit(1);
}
if (!config.apiKey) console.warn('ANIMEAPI_KEY is missing: /anime will tell users the bot is not set up.');

const telegram = createTelegram(token);

let me;
try {
  me = await telegram.getMe();
} catch (error) {
  console.error(`Could not sign in to Telegram. Check TELEGRAM_TOKEN. (${error.message})`);
  process.exit(1);
}
await telegram.setMyCommands([{ command: 'anime', description: 'Generate an anime image: /anime your prompt' }]);
console.log(`Ready as @${me.username}. Send /anime your prompt`);

// Long polling: no public URL or webhook needed.
let offset = 0;
for (;;) {
  let updates = [];
  try {
    updates = await telegram.getUpdates(offset);
  } catch (error) {
    console.warn(error.message);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    continue;
  }
  for (const update of updates) {
    offset = update.update_id + 1;
    if (update.message?.text) handleMessage(update.message, telegram).catch((error) => console.error(error));
  }
}
