# AnimeAPI Telegram 机器人模板

一个只有一条命令 `/anime prompt` 的小型 Telegram 机器人，回复一张动漫插画。由 [AnimeAPI](https://animeapi.ai) 驱动，它是最便宜的动漫图片 API 之一：**每张 $0.003**，预付余额 $5 起、永不过期，无订阅。新账号免费 3 张，无需绑卡。

[English](README.md) · **简体中文** · [日本語](README.ja.md)

点击页面顶部的 **Use this template** 创建你自己的副本。

## 运行

需要 [Node.js](https://nodejs.org) 20.6 或更高版本。无需安装任何依赖。

```sh
git clone https://github.com/animeapi-ai/telegram-bot-starter
cd telegram-bot-starter
cp .env.example .env    # 然后填写下面两个值
npm start
```

填写 `.env`：

| 值 | 获取方式 |
| --- | --- |
| `TELEGRAM_TOKEN` | 在 Telegram 中找 [@BotFather](https://t.me/BotFather)，发送 `/newbot` 并复制 token |
| `ANIMEAPI_KEY` | <https://animeapi.ai/dashboard/api-keys>（以 `ank_` 开头） |

然后给机器人发消息：`/anime 雨天公交站打着红伞的女孩`。

机器人使用长轮询，无需公网地址，在笔记本或任意服务器上都能运行。

## 功能

- `/anime <提示词>`；在最前面加 `portrait`、`square` 或 `landscape` 可指定画幅：`/anime landscape 秋天的神社`
- AnimeAPI 不生成成人内容。露骨的提示词会被拒绝，且不收费。
- **每用户冷却**：每位用户两张图之间间隔 30 秒（`COOLDOWN_SECONDS`，`0` 为关闭）。
- **余额不足**：机器人会明确提示，并给出充值链接。
- 提示词被拒绝时显示原因；繁忙或失败会自动重试一次，仍失败则退款。
- 图片会下载后作为照片上传到 Telegram，可长期保留在聊天中。
- 支持私聊和群组（可识别 `/anime@YourBot`）。

## 配置

均为可选，写在 `.env`：

| 配置 | 默认 | 说明 |
| --- | --- | --- |
| `ANIMEAPI_MODEL` | `anime` | 每张 `anime` $0.003、`ultra` $0.01、`ultra-max` $0.02 |
| `ANIMEAPI_ORIENTATION` | `portrait` | 用户未指定时使用 |
| `COOLDOWN_SECONDS` | `30` | 每位用户 |

## 链接

- AnimeAPI：<https://animeapi.ai> · [文档](https://animeapi.ai/docs) · [API 参考](https://animeapi.ai/docs/api-reference)
- 许可证：[MIT](LICENSE)
