const config = require('../../config');
const path = require('path');

module.exports = {
  aliases: [path.basename(__filename).split('.')[0], 'login', 'link'],
  permissions: [],
  disabled: false,
  description: 'Allows a user to link their steam account with discord.',
  command: (client, message) => {
    message.author.send({
      embed: {
        author: {
          name: client.user.username,
          icon_url: client.user.avatarURL
        },
        color: Number(config.colour),
        title: 'Register discord',
        description: module.exports.description,
      }
    });
  }
};
