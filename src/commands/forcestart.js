const config = require('../../app/config');
const path = require('path');
const queueHelper = require('../helpers/queue');

module.exports = {
  aliases: [path.basename(__filename).split('.')[0], 'fs', 'fstart', 'matchstart'],
  permissions: [],
  description: 'Allows a player to join the matchmaking queue',
  disabled: true,
  command: (client, message, args) => {
    const [channelOneId, channelTwoId] = args;

    const response = queueHelper.remove(message.author.id);

    if (response.didRemove) {
      message.channel.send({
        embed: {
          author: {
            name: client.user.username,
            icon_url: client.user.avatarURL
          },
          color: Number(config.colour),
          description: `<@${message.author.id}> just started a match.`
        }
      });
    }
  }
};
