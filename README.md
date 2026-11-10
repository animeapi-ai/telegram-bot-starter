# AnimeAPI Telegram bot starter

A small Telegram bot with one command, `/anime prompt`, that replies with an anime illustration. It runs on [AnimeAPI](https://animeapi.ai), one of the cheapest anime image APIs: **$0.003 per image**, prepaid balance from $5 that never expires, no subscription. New accounts get 3 free images, no card needed.

**English** · [简体中文](README.zh-CN.md) · [日本語](README.ja.md)

Click **Use this template** at the top of the page to get your own copy.

## Run it

You need [Node.js](https://nodejs.org) 20.6 or newer. There is nothing to install: the bot has no dependencies.

```sh
git clone https://github.com/animeapi-ai/telegram-bot-starter
cd telegram-bot-starter
cp .env.example .env    # then fill in the two values below
npm start
```

Fill in `.env`:

| Value | Where to get it |
| --- | --- |
| `TELEGRAM_TOKEN` | In Telegram, message [@BotFather](https://t.me/BotFather), send `/newbot` and copy the token |
| `ANIMEAPI_KEY` | <https://animeapi.ai/dashboard/api-keys> (starts with `ank_`) |

Then message your bot: `/anime a girl with a red umbrella at a rainy bus stop`.

The bot uses long polling, so it works from a laptop or any server without a public address.

## What it does

- `/anime <prompt>`; put `portrait`, `square` or `landscape` first to choose the shape: `/anime landscape a shrine in autumn`
- **Safe by default**: NSFW output is off (`ALLOW_NSFW=false`). Flagged images are refused and refunded, not posted.
- **Per-user cooldown**: 30 seconds between images per user (`COOLDOWN_SECONDS`, `0` turns it off).
- **Balance empty**: the bot says so and gives the owner the add-funds link instead of failing silently.
- Rejected prompts show the reason; busy or failed generations are retried once and refunded if they still fail.
- The image is downloaded and uploaded to Telegram as a photo, so it stays in the chat.
- Works in private chats and groups (`/anime@YourBot` is understood).

## Settings

All optional, in `.env`:

| Setting | Default | Notes |
| --- | --- | --- |
| `ANIMEAPI_MODEL` | `anime` | `anime` $0.003, `ultra` $0.01, `ultra-max` $0.02 per image |
| `ANIMEAPI_ORIENTATION` | `portrait` | Used when the user does not pick one |
| `ALLOW_NSFW` | `false` | Set `true` only for chats you control |
| `COOLDOWN_SECONDS` | `30` | Per user |

## Files

```
src/index.js      starts the bot and polls Telegram
src/handler.js    what happens when someone sends /anime
src/telegram.js   the few Telegram Bot API calls the bot needs
src/animeapi.js   the AnimeAPI call, retry and error messages
src/cooldown.js   per-user cooldown
src/config.js     reads .env
```

## Links

- AnimeAPI: <https://animeapi.ai> · [Docs](https://animeapi.ai/docs) · [Telegram bot guide](https://animeapi.ai/docs/telegram-bot) · [API reference](https://animeapi.ai/docs/api-reference)
- Licence: [MIT](LICENSE)
