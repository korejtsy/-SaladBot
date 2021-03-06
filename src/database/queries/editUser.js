const { User } = require('../index');

module.exports = async (userId, fields = {}) => {
  const where = { telegram_account_id: userId };

  return User
    .findOrCreate({ where, defaults: fields })
    .spread((user, created) => {
      if (!created) {
        User.update(fields, { where });
      }

      return user.get({ plain: true });
    });
};
