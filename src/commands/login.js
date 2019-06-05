const config = require('../../app/config');
const path = require('path');
const axios = require('axios');

module.exports = {
  aliases: [path.basename(__filename).split('.')[0], 'register', 'link'],
  permissions: [],
  disabled: false,
  description: 'Allows a user to link their steam account with discord.',
  command: (client, message) => {
    let author = message.author;

    axios.get(`${config.url}/discord/generate/${author.id}`)
      .then(response => {
        let { code,error } = response.data;

        if (code !== null) {
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
              description: `Please follow the URL below to link your Discord account to your Redline League profile. Ensure you're logged into the website with prior to linking. This link will expire in 15 minutes.`,
              fields: [
                {
                  name: 'Steam login URL:',
                  value: `${config.url}/discord/${author.id}/${code}`
                }
              ]
            }
          });
        } else {
          message.channel.send({
            embed: {
              color: Number(config.colour),
              description: `<@${author.id}> ${error} If you're really stuck then please message one of the **!authors**`
            }
          });
        }
      })
  }
};
