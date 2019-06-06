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
    aliases: [path.basename(__filename).split('.')[0], 'qj', 'jq', 'joinqueue'],
    permissions: [],
    disabled: false,
    description: 'Allows a player to join the matchmaking queue',
    command: (client, message) => {
      instance.get('/discord/check/' + message.author.id)
        .then(response => {
          if (!response.linked) {
            message.channel.send({
              embed: {
                author: {
                  name: client.user.username,
                  icon_url: client.user.avatarURL
                },
                color: Number(config.colour),
                description: `<@${message.author.id}> Please \`!login\` and try again.`
              }
            });

            return;
          }

          const queue = queueHelper.add(message.author.id);

          message.channel.send({
            embed: {
              author: {
                name: client.user.username,
                icon_url: client.user.avatarURL
              },
              color: Number(config.colour),
              description: `<@${message.author.id}> just joined the \`!queue\` (${queue.length} player${queue.length === 1 ? 's' : ''})`
            }
          });
        });
    }
};
