// The few Telegram Bot API calls this bot needs, with plain fetch. https://core.telegram.org/bots/api

export function createTelegram(token) {
  const base = `https://api.telegram.org/bot${token}`;

  async function call(method, body, timeoutMs = 60_000) {
    const isForm = body instanceof FormData;
    const res = await fetch(`${base}/${method}`, {
      method: 'POST',
      headers: isForm ? undefined : { 'Content-Type': 'application/json' },
      body: isForm ? body : JSON.stringify(body ?? {}),
      signal: AbortSignal.timeout(timeoutMs),
    });
    const data = await res.json().catch(() => ({}));
    if (!data.ok) {
      const error = new Error(`Telegram ${method} failed: ${data.description ?? `HTTP ${res.status}`}`);
      error.status = res.status;
      throw error;
    }
    return data.result;
  }

  return {
    getMe: () => call('getMe'),
    setMyCommands: (commands) => call('setMyCommands', { commands }),
    getUpdates: (offset) => call('getUpdates', { offset, timeout: 50, allowed_updates: ['message'] }, 65_000),
    sendMessage: (chatId, text, replyTo) => call('sendMessage', {
      chat_id: chatId,
      text,
      reply_parameters: replyTo ? { message_id: replyTo, allow_sending_without_reply: true } : undefined,
      link_preview_options: { is_disabled: true },
    }),
    sendChatAction: (chatId, action) => call('sendChatAction', { chat_id: chatId, action }),
    // Uploads the bytes; Telegram turns WebP and PNG into a regular photo.
    sendPhoto: (chatId, buffer, filename, caption, replyTo) => {
      const form = new FormData();
      form.set('chat_id', String(chatId));
      form.set('photo', new Blob([buffer]), filename);
      if (caption) form.set('caption', caption.slice(0, 1024));
      if (replyTo) form.set('reply_parameters', JSON.stringify({ message_id: replyTo, allow_sending_without_reply: true }));
      return call('sendPhoto', form, 120_000);
    },
  };
}
