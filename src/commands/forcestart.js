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

    let channelOne = client.channels.get(channelOneId);
    let channelTwo = client.channels.get(channelTwoId);

    if (!channelOne || !channelTwo) {
      message.author.send({
        embed: {
          author: {
            name: client.user.username,
            icon_url: client.user.avatarURL
          },
          color: Number(config.colour),
          description: `Looks like you haven't provided correct channel ids.`
        }
      });

      return;
    }

    if (channelOne.memberCount !== 5 || channelTwo.memberCount !== 5) {
      message.author.send({
        embed: {
          author: {
            name: client.user.username,
            icon_url: client.user.avatarURL
          },
          color: Number(config.colour),
          description: `Looks like these channels don't have the right number of people!`
        }
      });

      return;
    }

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
};
