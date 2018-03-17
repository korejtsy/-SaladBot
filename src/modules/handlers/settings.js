const editSettings = require('../store/editSettings');
const { Chat } = require('../../model');

module.exports = async (ctx) => {
  const chatID = ctx.update.message.chat.id;
  const text = ctx.message.text;
  if (text.startsWith('/')) {
    const match = text.match(/^\/([^\s]+)\s?(.+)?/);
    if (match !== null) {
      if (match[2]) {

        const pairs = match[2].split(',');

        let update = {};
        pairs.forEach( pair => {
          const [ prop, value ] = pair.split(':');

          if (prop && value) {
            update[prop.trim()] = value.trim();
          }
        });

        try {
          await editSettings(chatID, update);
        } catch(e) {
          console.log(e)
          ctx.reply('Error');
        }
      }
    }
  }
  const chat = await Chat.findOne({ where: { telegram_chat_id: chatID }});
  ctx.replyWithMarkdown(`
    Settings
    ===
    - street: ${chat.street}
    - house: ${chat.house_number}
    - floor: ${chat.floor}
    - budget: ${chat.budget}
  `);
}

