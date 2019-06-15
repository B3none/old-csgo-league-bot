const config = require('../../app/config');
const path = require('path');
const queueHelper = require('../helpers/queue');

module.exports = {
  aliases: [path.basename(__filename).split('.')[0], 'q'],
  permissions: [],
  description: 'View who is in the queue',
  command: (client, message) => {
    queueHelper.get()
      .then(players => {
        let fields = [];

        players.map((id, index) => {
          fields.push({
            name: `Player #${index + 1}`,
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
            description: `There ${players.length === 1 ? 'is' : 'are'} currently ${players.length} player${players.length === 1 ? '' : 's'} in the queue. We've sent you more data in a private message.`
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
      })
      .catch(() => {});
  }
};
