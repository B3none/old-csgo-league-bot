const textChannels = require('../../app/data/text_channels.json');
const config = require('../../app/config.json');
const matchmaker = require('./matchmaker.js');
const channels = require('./channels.js');

module.exports = {
  startReadyTimer: (ms, matchIn, client) => {
    const cache = require('node-file-cache').create({
      file: `${process.cwd()}/app/data/matches.json`,
      life: 240,
    });

    setTimeout(() => {
      let match = cache.get(matchIn) || [];

      console.log('----------------- NEW MATCH -------------------');

      if (match) {
        if (!match.allPlayersConfirmed) {
          console.log('All players haven\'t accepted.');
          let absentPlayersString = ``;

          const teamOne = match.team1.map(player => {
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

          const teamTwo = match.team2.map(player => {
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
            console.log('team one should be moved');
            Promise.all(teamTwo).then(() => {
              console.log('team two should be moved');
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

              cache.clear(matchIn);

              matchmaker.reloadQueue(client);
            });
          });
        }
      }
    }, ms);
  }
};
