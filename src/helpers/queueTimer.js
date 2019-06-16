const textChannels = require('../../app/data/text_channels.json');
const matches = require('../../app/data/matches.json');
const config = require('../../app/config.json');
const matchmaker = require('./matchmaker.js');
const channels = require('./channels.js');
const cache = require('node-file-cache').create({
  file: `${process.cwd()}/app/data/matches.json`,
  life: 1,
});

module.exports = {
  startReadyTimer: (ms, matchIn, client) => {
    setTimeout(() => {
      let matchesData = matches.index;
      matchesData.map(match => {
        console.log(match);

        if (match.key === matchIn) {
          if (!(match.val && match.val.allPlayersConfirmed)) {
            console.log('All players haven\'t accepted.');
            let absentPlayersString = ``;

            match.val.team1.map(player => {
              if (!player.confirmed) {
                absentPlayersString += `\n${player.name}`;
                channels.toAfkChannel(client, player.id);
              }
            });

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

            cache.set(matchIn, undefined);

            setTimeout(() => {
              matchmaker.reloadQueue(client);
            }, 2000);
          }
        }
      });
    }, ms);
  }
};
