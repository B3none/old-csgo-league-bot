const config = require('../../app/config');
const path = require('path');
const queueHelper = require('../helpers/queue');
const game = require('../helpers/game');
module.exports = {
  aliases: [path.basename(__filename).split('.')[0], 'r'],
  permissions: [],
  description: 'Ready up for a game',
  command: (client, message) => {
    queueHelper.get()
      .then(players => {
        players.map((player, index) => {
          if (message.author.id == player.id && player.confirmable === true) {
            if (player.confirmed === true) {
              message.channel.send({
                embed: {
                  author: {
                    name: client.user.username,
                    icon_url: client.user.avatarURL
                  },
                  color: Number(config.colour),
                  description: `You have already confirmed this match!`
                }
              });

              return;
            }

            message.channel.send({
              embed: {
                author: {
                  name: client.user.username,
                  icon_url: client.user.avatarURL
                },
                color: Number(config.colour),
                description: `Player: ${player.id} confirmed his match!`
              }
            });
            queueHelper.setConfirmed(player.id, true);
            game.changePlayerReadyStatus(player.id, true, client)
            //ADD THEM INTO AN ARRAY WITH ALL THE CONFIRMED PLAYERS........................

          } else if (message.author.id == player.id && player.confirmable === false) {
            message.channel.send({
              embed: {
                author: {
                  name: client.user.username,
                  icon_url: client.user.avatarURL
                },
                color: Number(config.colour),
                description: `We haven't found a match for you yet!`
              }
            });
          } else if (index === players.length || players.length === 0) {
            message.channel.send({
              embed: {
                author: {
                  name: client.user.username,
                  icon_url: client.user.avatarURL
                },
                color: Number(config.colour),
                description: `You have not been registered in the queue, please join the queueing channel in order to get registered.`
              }
            });
          }
        });
      })
      .catch(() => {});
  }
};
