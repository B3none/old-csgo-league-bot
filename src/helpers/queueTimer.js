const textChannels = require('../../app/data/text_channels.json');
const config = require('../../app/config.json');
const voiceChannels = require('../../app/data/voice_channels');
const matchmaker = require('./matchmaker.js');
const channels = require('./channels.js');
const match = require('./match');

module.exports = {
  startReadyTimer: (ms, matchId, client) => {
    let queueChannel = client.channels.find(channel => channel.id === voiceChannels.queueChannelId);
    if (!queueChannel) {
      return;
    }

    queueChannel.edit({
      userLimit: 1
    });

    setTimeout(() => {
      match.get(matchId)
        .then(matchData => {
          if (!matchData || matchData.allPlayersConfirmed) {
            return;
          }

          console.log('All players haven\'t accepted.');
          let absentPlayersString = ``;

          const teamOne = matchData.team1.map(player => {
            return new Promise(resolve => {
              if (!player.confirmed) {
                absentPlayersString += `\n${player.name}`;
                channels.toAfkChannel(client, player.id)
                  .then(() => {
                    resolve();
                  });
              }

              resolve();
            });
          });

          const teamTwo = matchData.team2.map(player => {
            return new Promise(resolve => {
              if (!player.confirmed) {
                absentPlayersString += `\n${player.name}`;
                channels.toAfkChannel(client, player.id)
                  .then(() => {
                    resolve();
                  });
              }
            });
          });

          Promise.all(teamOne).then(() => {
            Promise.all(teamTwo).then(() => {
              client.channels.get(textChannels.queueChannelId.toString()).send({
                embed: {
                  author: {
                    name: client.user.username,
                    icon_url: client.user.avatarURL
                  },
                  color: Number(config.colour),
                  description: `Match is canceled. The match wasn't accepted by: ${absentPlayersString}`
                }
              });

              match.end(matchId)
                .then(() => {
                  queueChannel.edit({
                    userLimit: config.players_per_match
                  });

                  matchmaker.reloadQueue(client);
                });
            });
          });
        });
    }, ms);
  }
};
