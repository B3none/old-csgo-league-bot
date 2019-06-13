const queue = require('./queue.js');
const config = require('../../app/config');
const channels = require('./channels');
const fs = require('fs');

const cache = require('node-file-cache').create({
  file: `${process.cwd()}/app/data/matches.json`,
  life: 240
});
module.exports = {
    sendAwaitConfirmation: (client) => {
        queue.get()
        .then(players => {
            players.map((player, index) => {
                queue.setConfirmable(player.id, true);
                client.users.find(x => x.id == player.id).send({
                    embed: {
                      author: {
                        name: client.user.username,
                        icon_url: client.user.avatarURL
                      },
                      color: Number(config.colour),
                      description: `Please confirm the match inside by typing ${config.prefix}ready inside the confirm-match text channel.`
                    }
                  })
            });
        });
    },
    initialize: (players) => {
      //GET THE ELO. AND SETUP TEAMS.
      let team1 = [];
      let team2 = [];
      
      //players = [{elo: 23}, {elo: 42}, {elo: 32}, {elo: 22}];
      let lowestEloPlayer = {elo: 99999};

      let json = {
        "matchid": Math.floor(Math.random(0, 1)* 100),
        hasStarted: false,
        allPlayersConfirmed: false,
        team1: team1,
        team2: team2
      }
      
      let playersEloSorted = [];
      for(let i = 0; i < players.length; i++){
        playersEloSorted.push(players[i].elo);
      }
      playersEloSorted = playersEloSorted.sort();

      for(let i = 0; i < playersEloSorted.length; i += 2){
        team1.push(players.find(player => player.elo === playersEloSorted[i]));
      }
      for(let i = 1; i < playersEloSorted.length; i += 2){
        team2.push(players.find(player => player.elo === playersEloSorted[i]));
      }

      json.team1 = team1;
      json.team2 = team2;

      //I NEED TO ADD SUPPORT FOR MULTIPLE GAMES LATER DOW THE ROAD YES I KNOW.
      const matchData = json;
      cache.set('match', matchData);
    },

    changePlayerReadyStatus: (playerid, ready, client) => {
      const matchData = cache.get('match') || [];
      
      let hasAllPlayerConfirmed = true;
      matchData.team1.map((item, index) => {
        if(item.id === playerid){
          item.confirmed = ready;
        }
        if(item.confirmed === false) hasAllPlayerConfirmed = false; 
      });
      matchData.team2.map((item, index) => {
        if(item.id === playerid){
          item.confirmed = ready;
        }
        if(item.confirmed === false) hasAllPlayerConfirmed = false; 
      });
      matchData.allPlayersConfirmed = hasAllPlayerConfirmed;
      cache.set('match', matchData);
      if(matchData.allPlayersConfirmed){
        console.log("All players has confirmed.");
        
        fs.readFile(`${process.cwd()}/app/data/textchannels.json`, 'utf-8', (err, data) => {
          if(err) throw err;

          let team1Message = '';
          let team2Message = '';
          for(let index in matchData.team1){
            if(matchData.team1[index]) team1Message += `@${matchData.team1[index].name} with elo: ${matchData.team1[index].elo}\n`;

          }
          for(let index in matchData.team2){
            if(matchData.team2[index]) team2Message += `@${matchData.team2[index].name} with elo: ${matchData.team2[index].elo}\n`;
          }
          
          client.channels.get(JSON.parse(data).queueChannelID.toString()).send({
            embed: {
              author: {
                name: client.user.username,
                icon_url: client.user.avatarURL
              },
              color: Number(config.colour),
              description: `\`All players have confirmed. You will now be sent to team channels.!\`\n\nTeam 1: \n${team1Message} \n\nTeam 2: \n${team2Message}  `
            }
          });
          //SEND THEM TO DIFFERENT CHANNELS.
          channels.switchToTeamChannels(client, matchData.team1, matchData.team2);
        })
        
      }
    }
}