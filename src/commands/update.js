const config = require('../../app/config');
const path = require('path');
const axiosHelper = require('../helpers/axios');
const axios = axiosHelper.get();

module.exports = {
  aliases: [path.basename(__filename).split('.')[0], 'chck', 'chcek', 'check'],
  permissions: [],
  description: 'Allows a user to update their Discord name on the league service.',
  command: (client, message) => {
    let author = message.author;

    axios.post(`/discord/update/${author.id}`, {
      discord_name: author.username
    })
      .then(response => {
        const { success,error } = response.data;

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
              name: 'Please link your discord with our system first using the \`!login\` command.'
            });
          }

          message.author.send(message);
          return;
        }

        let user = client.users.find(user => user.id && message.author.id);
        user.addRoles(client.roles.find(role => role.name === config.linked_role))
          .then(() => {
            message.channel.send({
              embed: {
                color: Number(config.colour),
                description: `<@${author.id}> You've successfully updated your name on our system.`
              }
            });
          });
      })
      .catch(o_O => {
        message.author.send({
          embed: {
            author: {
              icon_url: client.user.avatarURL,
              name: `${client.user.username} Authenticator`
            },
            color: Number(config.colour),
            description: `There was an error updating your name :(`,
            fields: []
          }
        });
      })
  }
};
