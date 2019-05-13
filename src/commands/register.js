const config = require('../../config');
const path = require('path');
const axios = require('axios');

module.exports = {
  aliases: [path.basename(__filename).split('.')[0], 'login', 'link'],
  permissions: [],
  disabled: false,
  description: 'Allows a user to link their steam account with discord.',
  command: (client, message) => {
    let author = message.author;

    axios.get(`https://league.redlinecs.net/discord/generate/${author.id}`)
      .then(response => {
        let { code } = response.data;

        message.channel.send({
          embed: {
            color: Number(config.colour),
            description: `<@${author.id}> Please follow the instructions sent directly to you in order to complete the registration process.`
          }
        });

        message.author.send({
          embed: {
            author: {
              icon_url: client.user.avatarURL,
              name: `${client.user.username} Authenticator`
            },
            color: Number(config.colour),
            description: `Please follow the following url in order to link your discord to our system. Please ensure you're logged in to our website with steam first.`,
            fields: [
              {
                name: 'Steam login URL:',
                value: `http://league.redlinecs.net/discord/${author.id}/${code}`
              }
            ]
          }
        });
      })
  }
};
