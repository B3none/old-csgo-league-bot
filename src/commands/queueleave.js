const config = require('../../app/config');
const path = require('path');
const queueHelper = require('../helpers/queue');
const axios = require('axios');

const instance = axios.create({
  baseURL: config.url,
  timeout: 1000,
  headers: {
    'authentication': config.api_key
  }
});

module.exports = {
    aliases: [path.basename(__filename).split('.')[0], 'ql', 'lq', 'leavequeue'],
    permissions: [],
    disabled: false,
    description: 'Allows a player to join the matchmaking queue',
    command: (client, message) => {
      const response = queueHelper.remove(message.author.id);

      if (response.didRemove) {
        message.channel.send({
          embed: {
            author: {
              name: client.user.username,
              icon_url: client.user.avatarURL
            },
            color: Number(config.colour),
            description: `<@${message.author.id}> just left the \`!queue\` (${response.queue.length} player${response.queue.length === 1 ? 's' : ''})`
          }
        });
      }
    }
};
