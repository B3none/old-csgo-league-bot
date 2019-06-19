const config = require('../../app/config');
const path = require('path');
const axiosHelper = require('../helpers/axios');
const axios = axiosHelper.get();


const displayPlayer = (channel, user, playerData) => {
  const {
    score, steam, kills, deaths,
    assists, head, damage, totalRounds
  } = playerData;

  channel.send({
    embed:{
      color: Number(config.colour),
      author: {
        url: `${config.url}/profile/${steam}`,
        name: `${user.username}'s Profile | Points: ${score}`,
      },
      thumbnail: {
        url: user.avatarURL
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
          value: (Math.round((kills / (deaths || 1)) * 100) / 100).toString(),
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
          value: (Math.round(((head / kills) * 100) * 100) / 100).toString() + '%',
          inline: true,
        },
        {
          name: `ADR:`,
          value: (Math.round((damage / totalRounds) * 100) / 100).toString(),
          inline: true,
        },
      ]
    },
  });
};

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

          displayPlayer(message.channel, message.author, {
            score, steam, kills, deaths,
            assists, head, damage, totalRounds
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
      let nameLookup = message.content.toString().split(' ')[1];
      let targetUser = false;

      if (message.mentions.members.first()) {
        targetUser = message.mentions.members.first().user;
      }

      if (!targetUser && nameLookup) {
        client.users.map(user => {
          if (user.username === nameLookup) {
            targetUser = user;
          }
        });
      }

      if (targetUser) {
        axios.get(`/player/discord/${targetUser.id}`)
          .then(response => {
            const {
              score, steam, kills, deaths,
              assists, rounds_tr, rounds_ct,
              head, damage
            } = response.data;

            const totalRounds = parseInt(rounds_tr) + parseInt(rounds_ct);

            displayPlayer(message.channel, targetUser, {
              score, steam, kills, deaths,
              assists, head, damage, totalRounds
            });
          })
          .catch(o_O => {
            message.author.send({
              embed: {
                author: {
                  icon_url: client.user.avatarURL,
                  name: `${client.user.username}`
                },
                color: Number(config.colour),
                description: `There was an error getting your profile data.`,
                fields: []
              }
            });
          });
      } else {
        message.channel.send({
          embed: {
            color: Number(config.colour),
            description: `No user found! :o`
          }
        });
      }
    }
  }
};
