const config = require('../../app/config');
const path = require('path');
const queueHelper = require('../helpers/queue');

module.exports = {
    aliases: [path.basename(__filename).split('.')[0], 'qj', 'joinqueue'],
    permissions: [],
    disabled: false,
    description: 'Allows a player to join the matchmaking queue',
    command: (client, message) => {

      const queue = queueHelper.add(message.author.id);

      message.channel.send({
        embed: {
          author: {
            name: client.user.username,
            icon_url: client.user.avatarURL
          },
          color: Number(config.colour),
          description: `<@${message.author.id}> just joined the \`!queue\` | (${queue.length}/10)`
        }
      });
    }
};
