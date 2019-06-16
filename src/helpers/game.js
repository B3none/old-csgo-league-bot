const queue = require('./queue.js');
const channels = require('./channels');
const config = require('../../app/config');
const textChannels = require('../../app/data/text_channels');
const queueTimer = require('./queueTimer');
const axiosHelper = require('./axios');
const error = require('./error');
const axios = axiosHelper.get();

const cache = require('node-file-cache').create({
  file: `${process.cwd()}/app/data/matches.json`,
  life: 240
});

// const generateMatchId = length => {
//   let result = '';
//   const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//   const charactersLength = characters.length;
//
//   for (let i = 0; i < length; i++) {
//     result += characters.charAt(Math.floor(Math.random() * charactersLength));
//   }
//
//   return result;
// };

module.exports = {
  finalizeGameData: (client, teams) => {
    console.log('inside finalise game data');

    //RESET THE QUEUE
    queue.reset();

    //SEND REQUEST TO ENDPOINT.
    console.log('call servers endpoint');
    axios.get(`/servers`)
      .then(response => {
        console.log("got response");
        console.log(response.data);

        const serverStatus = response.data[0];
        const { server } = serverStatus;
        const [ip, port] = server.split(':');

        let players = [];
        let team_one = [];
        teams.team1.map(player => {
          team_one[player.steam] = player.name;
          players.push(player.id);
        });

        let team_two = [];
        teams.team2.map(player => {
          team_two[player.steam] = player.name;
          players.push(player.id);
        });

        console.log('would be sending...');
        console.log({
          ip,
          port,
          team_one,
          team_two
        });

        players.map(playerId => {
          let user = client.fetchUser(playerId);

          user.sendMessage(`Please connect to the server:\n\`connect ${ip}:${port}\``);
        })

        // axios.post(`/match/start`, {
        //   ip,
        //   port,
        //   team_one,
        //   team_two
        // })
        //   .then(response => {
        //     // const {match_id} = data;
        //
        //     players.map(playerId => {
        //       let user = client.fetchUser(playerId);
        //
        //       user.message(`Please connect to the server:`);
        //       user.message(`\`connect ${ip}:${port}\``);
        //     })
        //   })
        //   .catch(error);
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
            description: `Please confirm the match inside by typing \`${config.prefix}ready\` in #${config.queue_text_channel} text channel. You have ${(config.match_confirmation_timer / 1000)} seconds.`
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
      matchId: Math.floor(Math.random() * 100),
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

    //I NEED TO ADD SUPPORT FOR MULTIPLE GAMES LATER DOWN THE ROAD YES I KNOW.
    // const matchId = generateMatchId(10);
    cache.set(/*matchId*/"match0", json);
    queueTimer.startReadyTimer(config.match_confirmation_timer, /*matchId*/"match0", client);

    // return matchId;
  },
  changePlayerReadyStatus: (playerid, ready, client) => {
    const matchData = cache.get("match0") || [];

    let hasAllPlayerConfirmed = true;
    matchData.team1.map(item => {
      if (item.id === playerid) {
        item.confirmed = ready;
      }

      if (!item.confirmed) {
        hasAllPlayerConfirmed = false;
      }
    });

    if (hasAllPlayerConfirmed) {
      matchData.team2.map(item => {
        if (item.id === playerid) {
          item.confirmed = ready;
        }

        if (!item.confirmed) {
          hasAllPlayerConfirmed = false;
        }
      });
    }

    matchData.allPlayersConfirmed = hasAllPlayerConfirmed;
    cache.set("match0", matchData);
    if (matchData.allPlayersConfirmed) {
      console.log("All players have confirmed.");

      let team1Message = '';
      matchData.team1.map(player => {
        team1Message += `<@${player.id}> | \`${player.elo} elo\`\n`;
      });

      let team2Message = '';
      matchData.team2.map(player => {
        team2Message += `<@${player.id}> | \`${player.elo} elo\`\n`;
      });

      client.channels.get(textChannels.queueChannelId.toString()).send({
        embed: {
          author: {
            name: client.user.username,
            icon_url: client.user.avatarURL
          },
          color: Number(config.colour),
          description: `\`All players have confirmed. You will now be sent to the team channels!\`\n\nTeam 1: \n${team1Message} \n\nTeam 2: \n${team2Message}  `
        }
      });

      //SEND THEM TO DIFFERENT CHANNELS.
      channels.switchToTeamChannels(client, matchData.team1, matchData.team2);
    }
  }
};
