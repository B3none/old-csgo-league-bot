const queue = require('./queue.js');
const channels = require('./channels');
const config = require('../../app/config');
const textChannels = require('../../app/data/text_channels');
const queueTimer = require('./queueTimer');
const axiosHelper = require('./axios');
const axios = axiosHelper.get();

const cache = require('node-file-cache').create({
  file: `${process.cwd()}/app/data/matches.json`,
  life: 240
});
module.exports = {
  finalizeGameData: (client, teams) => {
    //RESET THE QUEUE
    queue.reset();

    //SEND REQUEST TO ENDPOINT.
    axios.get(`/servers`)
      .then(response => {
        const { server } = response.data;
        [ip, port] = server.split(':');

        axios.post(`/match/start`, {
          ip: ip,
          port: port,
          team_one: teams.team1,
          team_two: teams.team2
        })
          .then(response => {
            const { match_id } = data;

            // match_id
          });
      });
  },
  sendAwaitConfirmation: (client) => {
    queue.get()
    .then(players => {
      players.map(player => {
        queue.setConfirmable(player.id, true);
        client.users.find(x => x.id === player.id).send({
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
  initialize: (players, client) => {
    //GET THE ELO. AND SETUP TEAMS.
    let team1 = [];
    let team2 = [];

    let json = {
      matchid: Math.floor(Math.random() * 100),
      hasStarted: false,
      hasEnded: false,
      allPlayersConfirmed: false,
      team1: team1,
      team2: team2
    };

    let playersEloSorted = [];
    for (let i = 0; i < players.length; i++) {
      playersEloSorted.push(players[i].elo);
    }

    playersEloSorted = playersEloSorted.sort();

    for (let i = 0; i < playersEloSorted.length; i += 2) {
      team1.push(players.find(player => player.elo === playersEloSorted[i]));
    }

    for (let i = 1; i < playersEloSorted.length; i += 2) {
      team2.push(players.find(player => player.elo === playersEloSorted[i]));
    }

    json.team1 = team1;
    json.team2 = team2;

    //I NEED TO ADD SUPPORT FOR MULTIPLE GAMES LATER DOW THE ROAD YES I KNOW.
    cache.set("match0", json);
    queueTimer.startReadyTimer(config.matchConfirmationTimer, "match0", client);
  },
  changePlayerReadyStatus: (playerid, ready, client) => {
    const matchData = cache.get("match0") || [];

    let hasAllPlayerConfirmed = true;
    matchData.team1.map(item => {
      if (item.id === playerid) {
        item.confirmed = ready;
      }

      if (item.confirmed === false) {
        hasAllPlayerConfirmed = false;
      }
    });

    matchData.team2.map(item => {
      if (item.id === playerid) {
        item.confirmed = ready;
      }

      if (item.confirmed === false) {
        hasAllPlayerConfirmed = false;
      }
    });

    matchData.allPlayersConfirmed = hasAllPlayerConfirmed;
    cache.set("match0", matchData);
    if (matchData.allPlayersConfirmed) {
      console.log("All players has confirmed.");

      let team1Message = '';
      let team2Message = '';
      for (let index in matchData.team1) {
        if (matchData.team1[index]) {
          team1Message += `@${matchData.team1[index].name} with elo: ${matchData.team1[index].elo}\n`;
        }
      }

      for (let index in matchData.team2) {
        if (matchData.team2[index]) {
          team2Message += `@${matchData.team2[index].name} with elo: ${matchData.team2[index].elo}\n`;
        }
      }

      client.channels.get(textChannels.queueChannelId.toString()).send({
        embed: {
          author: {
            name: client.user.username,
            icon_url: client.user.avatarURL
          },
          color: Number(config.colour),
          description: `\`All players has confirmed. You will now be sent to the team channels!\`\n\nTeam 1: \n${team1Message} \n\nTeam 2: \n${team2Message}  `
        }
      });
      //SEND THEM TO DIFFERENT CHANNELS.
      channels.switchToTeamChannels(client, matchData.team1, matchData.team2);
    }
  }
};
