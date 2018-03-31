const makeOrder = require('../browser-actions/makeOrder');
const fs = require('fs');
const map = require('lodash/map');
const reduce = require('lodash/reduce');
const getOrder = require('../database/queries/getOrder');
const getRandomUser = require('../lib/getRandomUser');
const editOrder = require('../database/queries/editOrder');
const isValidOrder = require('../validators/order');

const line = '======================================================'

module.exports = async (ctx) => {
  const chatID = ctx.update.message.chat.id;
  ctx.reply('Ordering...');

  const order = await getOrder(chatID);
  const user = await getRandomUser(order);

  if (order) {
    await editOrder(order.id, { status: 'ordered' });
  } else {
    ctx.reply('All orders are finished');
    return;
  }

  if (!isValidOrder(ctx, user, order.chat)) {
    return;
  }

  const result = await makeOrder(order, user);
  if (!result) {
    ctx.reply('some errror');
    return;
  }

  const discount = order.chat.budget
    ? (order.chat.budget / Object.keys(result).length).toFixed()
    : 0;

  const md = `👤 User: *${user.name}* \n${line}\n\n\n${
    map(result, (price, name, i) =>
      `${i+1}) *${name}*: ${price} - ${discount} = *${price - discount} грн.* ${i !== Object.keys(result).length - 1 ? '\n' : ''}`
    )
    }\n${line}\n*Sum: ${reduce(result, (result, value) => (result += value), 0)} грн*`;

  ctx.replyWithMarkdown(md);
  ctx.replyWithPhoto({ source: fs.createReadStream('./screenshots/cart.png') });
};
