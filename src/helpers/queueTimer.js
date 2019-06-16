const textChannels = require('../../app/data/text_channels.json');
const config = require('../../app/config.json');
const cache = require('node-file-cache').create({
  file: `${process.cwd()}/app/data/matches.json`,
  life: 240,
});

module.exports = {
  startReadyTimer: (ms, match, client) => {
    setTimeout(() => {
      const matchData = cache.get(match) || [];

      if (!matchData.allPlayersConfirmed) {
        console.log("All players haven't accepted.");
        let playersWhoHaventAcceptedString = ``;
        console.log(matchData);

        matchData.team1.map((player) => {
          if(!player.confirmed){
            playersWhoHaventAcceptedString += `\n${player.name}`
          }
        })

        client.channels.get(textChannels.queueChannelId.toString()).send({
          embed: {
            author: {
              name: client.user.username,
              icon_url: client.user.avatarURL
            },
            color: Number(config.colour),
            description: `Match is canceled. The match wasn't accepted by: ${playersWhoHaventAcceptedString}`
          }
        });
      }
      cache.set(match, undefined);

    }, ms)
  }
};