const config = require('../../app/config');
const path = require('path');
const axiosHelper = require('../helpers/axios');
const axios = axiosHelper.get();

module.exports = {
  aliases: [path.basename(__filename).split('.')[0]],
  permissions: [],
  description: 'Check your elo',
  command: (client, message) => {
    let author = message.author;
    if((message.content.length - config.prefix.length) === 3){
        axios.post(`/player/discord/${author.id}`, {
            discord_name: author.username
          })
            .then(response => {
              const { elo } = response.data;
              
              message.channel.send({
                embed: {
                  color: Number(config.colour),
                  description: `<@${author.id}> has an elo of ${elo}`
                }
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
                  description: `There was an error getting your elo`,
                  fields: []
                }
              });
        })
    }else if((message.content.length - config.prefix.length) > 3){
        
        let user = message.mentions.members.first();
        axios.post(`/player/discord/${user.id}`, {
            discord_name: author.username
          })
            .then(response => {
              const { elo } = response.data;
              
              message.channel.send({
                embed: {
                  color: Number(config.colour),
                  description: `<@${user.id}> has an elo of ${elo}`
                }
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
                  description: `There was an error getting your elo`,
                  fields: []
                }
              });
        }
            )}

  }
};
