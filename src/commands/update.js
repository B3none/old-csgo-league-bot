const config = require('../../app/config');
const path = require('path');
const axios = require('axios');

const instance = axios.create({
  baseURL: config.url,
  timeout: 1000,
  headers: {
    'authentication': config.api_key
  }
});

module.exports = {
  aliases: [path.basename(__filename).split('.')[0]],
  permissions: [],
  disabled: true,
  description: 'Allows a user to update their Discord name on the league service.',
  command: (client, message) => {
    let author = message.author;

    instance.post(`/discord/update/${author.id}`, {
      name: author.username
    })
      .then(response => {
        let { success,error } = response.data;

        if (!success) {
          let message = {
            embed: {
              author: {
                icon_url: client.user.avatarURL,
                name: `${client.user.username} Authenticator`
              },
              color: Number(config.colour),
              description: `There was an error updating your name!`,
              fields: []
            }
          };

          if (error === 'link_discord') {
            message.embed.fields.push({
              name: 'Please link your discord with our system first using the !login command.'
            });
          }

          message.author.send(message);
          return;
        }

        message.channel.send({
          embed: {
            color: Number(config.colour),
            description: `<@${author.id}> You've successfully updated your name on our system.`
          }
        });
      })
  }
};
