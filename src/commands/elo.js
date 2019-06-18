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
            discord_name: undefined
          })
            .then(response => {
              const { elo, steam } = response.data;
              message.channel.send({
                  embed:{
                    color: Number(config.colour),
                    author: {
                        url: ` https://league.voidrealitygaming.co.uk/profile/${steam}`,
                        name: `${author.username}`,
                    },
                    description : `Elo: ${elo}`
                  },

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
        let arg = message.content.toString().substr((config.prefix.length + 4), message.content.length);
        let usr;
        client.users.map((user, index) => {
            if(user.username === arg) usr = user;
        });
        if(!usr && message.mentions.members.first() ) {
            usr = message.mentions.members.first().user;
        }
        if(usr) {
            axios.post(`/player/discord/${usr.id}`, {
                discord_name: undefined
              })
                .then(response => {
                  const { elo, steam } = response.data;
                  
                  message.channel.send({
                    embed: {
                      color: Number(config.colour),
                      author: {
                        url: ` https://league.voidrealitygaming.co.uk/profile/${steam}`,
                        name: `${usr.username}`,
                      },
                      description : `Elo: ${elo}`
                    }
                  });
                })
                .catch(o_O => {
                  message.author.send({
                    embed: {
                      author: {
                        icon_url: client.user.avatarURL,
                        url: ` https://league.voidrealitygaming.co.uk/profile/steamid `,
                        name: `${client.user.username}`
                    },
                      color: Number(config.colour),
                      description: `There was an error getting your elo`,
                      fields: []
                    }
                  });
                }) 
        }

        }

  }
};
