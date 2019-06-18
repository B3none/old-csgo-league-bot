const config = require('../../app/config');
const path = require('path');
const axiosHelper = require('../helpers/axios');
const axios = axiosHelper.get();

module.exports = {
  aliases: [path.basename(__filename).split('.')[0], 'elo', 'stats'],
  permissions: [],
  description: 'Displays your profile stats.',
  command: (client, message) => {
    let author = message.author;
    if ((message.content.length - config.prefix.length) === 3) {
      axios.get(`/player/discord/${author.id}`)
        .then(response => {
          const {
            score, steam, kills, deaths,
            assists, rounds_tr, rounds_ct,
            head, damage
          } = response.data;

          const totalRounds = parseInt(rounds_tr) + parseInt(rounds_ct);

          message.channel.send({
            embed:{
              color: Number(config.colour),
              author: {
                  url: `${config.url}/profile/${steam}`,
                  name: `${author.username}'s Profile | Points: ${score}`,
              },
              thumbnail: {
                url: author.avatarURL
              },
              fields: [
                {
                  name: `Kills:`,
                  value: kills,
                  inline: true,
                },
                {
                  name: `Assists:`,
                  value: assists,
                  inline: true,
                },
                {
                  name: `KDR:`,
                  value: (kills / (deaths || 1)).toString(),
                  inline: true,
                },
                {
                  name: `Rounds Played:`,
                  value: totalRounds,
                  inline: true,
                },
                {
                  name: `Deaths:`,
                  value: deaths,
                  inline: true,
                },
                {
                  name: `Headshots:`,
                  value: head,
                  inline: true,
                },
                {
                  name: `HS Percentage:`,
                  value: ((head / kills) * 100).toString(),
                  inline: true,
                },
                {
                  name: `ADR:`,
                  value: (damage / totalRounds).toString(),
                  inline: true,
                },
              ]
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
              description: `There was an error getting your profile data.`,
              fields: []
            }
          });
      })
    } else if ((message.content.length - config.prefix.length) > 3) {
      let arg = message.content.toString().substr((config.prefix.length + 4), message.content.length);
      let usr;
      client.users.map(user => {
        if (user.username === arg) {
          usr = user;
        }
      });

      if (!usr && message.mentions.members.first()) {
          usr = message.mentions.members.first().user;
      }

      if (usr) {
        axios.get(`/player/discord/${usr.id}`)
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
          });
      }
    }
  }
};
