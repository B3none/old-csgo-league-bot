const textChannels = require('../../app/data/text_channels.json');
const config = require('../../app/config.json');
const fs = require('fs');
const cache = require('node-file-cache').create({
  file: `${process.cwd()}/app/data/matches.json`,
  life: 240,
});

module.exports = {
  startReadyTimer: (ms, matchIn, client) => {
    setTimeout(() => {
      fs.readFile(`${process.cwd()}/app/data/matches.json`, 'utf-8', (err, data) => {
        if(err) throw err;
        
        matchData = JSON.parse(data).index;
        matchData.map((match, index) => {
          if(match.key === matchIn){

            if (!match.val.allPlayersConfirmed) {
              console.log("All players haven't accepted.");
              let playersWhoHaventAcceptedString = ``;
              let playersWhoHaventAccepted = [];
              console.log(match.val);
      
              match.val.team1.map((player) => {
                if(!player.confirmed){
                  playersWhoHaventAcceptedString += `\n${player.name}`;
                  require('./channels.js').toAfkChannel(client, player.id);
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
              cache.set(matchIn, undefined);
              require('./matchmaker.js').reloadQueue(client);
            }  
          }

        });

      })

    }, ms)
  }
};
