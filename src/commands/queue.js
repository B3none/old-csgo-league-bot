const config = require('../../app/config');
const path = require('path');
const queueHelper = require('../helpers/queue');

module.exports = {
  aliases: [path.basename(__filename).split('.')[0], 'q'],
  permissions: [],
  disabled: false,
  description: 'View who is in the queue',
  command: (client, message) => {
    let queue = queueHelper.get();
    let fields = [];

    queue.map(id => {
      fields.push({
        name: '',
        value: `<@${id}>`
      });
    });

    message.channel.send({
      embed: {
        author: {
          name: client.user.username,
          icon_url: client.user.avatarURL
        },
        color: Number(config.colour),
        description: `There ${queue.length === 1 ? 'is' : 'are'} currently ${queue.length} player${queue.length === 1 ? 's' : ''} in the queue. We've sent you more data in a private message.`
      }
    });

    message.author.send({
      embed: {
        author: {
          name: client.user.username,
          icon_url: client.user.avatarURL
        },
        color: Number(config.colour),
        description: `The queue currently consists of:`,
        fields: fields
      }
    });
  }
};
