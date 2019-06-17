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
        message.channel.send({
          embed: {
            author: {
              name: client.user.username,
              icon_url: client.user.avatarURL
            },
            color: Number(config.colour),
            description: `There ${players.length === 1 ? 'is' : 'are'} currently ${players.length === 0 ? 'no' : players.length} player${players.length === 1 ? '' : 's'} in the queue. We've sent you more data in a private message.`
          }
        });

        let queueText = `The queue currently consists of: \n`;

        players.map((player, index) => {
          queueText += `<@${player.id}>`;

          if (index + 1 < players.length) {
            queueText += ', ';
          }
        });

        message.author.send({
          embed: {
            author: {
              name: client.user.username,
              icon_url: client.user.avatarURL
            },
            color: Number(config.colour),
            description: queueText
          }
        });
      })
      .catch(() => {});
  }
};
