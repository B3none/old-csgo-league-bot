const config = require('../../app/config');
const path = require('path');
const queueHelper = require('../helpers/queue');
const axiosHelper = require('../helpers/axios');
const axios = axiosHelper.get();

module.exports = {
  aliases: [path.basename(__filename).split('.')[0], 'qj', 'jq', 'joinqueue', 'qjoin'],
  permissions: [],
  description: 'Allows a player to join the matchmaking queue',
  disabled: true,
  command: (client, message) => {
    axios.get('/discord/check/' + message.author.id)
      .then(response => {
        const {linked} = response.data;

        if (!linked) {
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
