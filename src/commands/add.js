const Extra = require('telegraf/extra');
const pageParse = require('../browser-actions/pageParse');
const addItem = require('../database/queries/addItem');

module.exports = async (ctx) => {
  const args = ctx.state.command.args;
  const userId = ctx.update.message.from.id;
  const chatId = ctx.update.message.chat.id;

  // console.log(args);
  ctx.reply('Adding...');

  if (args && args.length) {
    const url = args[0];
    if (url === 'https://salad.com.ua/' || url === 'https://salad.com.ua/contacts/') {
      ctx.reply('Not valid link');
      return;
    }

    if (!/salad.com.ua/.test(url)) {
      ctx.reply('Not valid link');
      return;
    }

    try {
      const product = await pageParse(url);
      const orderItem = await addItem({ product, userId, chatId });

      if (product.mods_available.length) {
        const menu = Extra
          .markdown()
          .markup((m) => m.inlineKeyboard(
            product.mods_available.map(item =>
              m.callbackButton(item, `${orderItem.id}-${item}-${ctx.update.message.from.id}`)
            )
          ));

        console.log('ctx.state.product', product);
        ctx.reply('Please choose type:', menu);
        return;
      }

      ctx.reply(`👌 Product "${product.product_name}" has been added`);
      return;
    } catch (e) {
      console.error(e);
      ctx.reply(e.message);
    }
  }

  ctx.reply('Link not provided');
}
