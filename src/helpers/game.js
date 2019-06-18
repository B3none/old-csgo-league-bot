const queue = require('./queue.js');
const channels = require('./channels');
const config = require('../../app/config');
const textChannels = require('../../app/data/text_channels');
const queueTimer = require('./queueTimer');
const axiosHelper = require('./axios');
const match = require('./match');
const error = require('./error');
const axios = axiosHelper.get();

const cache = require('node-file-cache').create({
  file: `${process.cwd()}/app/data/matches.json`
});

module.exports = {
  finalizeGameData: (client, teams) => {
    //RESET THE QUEUE
    queue.reset();

    //SEND REQUEST TO ENDPOINT.
    axios.get(`/servers`)
      .then(response => {
        const serverStatus = response.data[0];
        if (serverStatus) {
          const {server} = serverStatus;
          const [ip, port] = server.split(':');

          let players = [];
          let team_one = {};
          teams.team1.map(player => {
            team_one[player.steam] = player.name;
            players.push(player.id);
          });

          let team_two = {};
          teams.team2.map(player => {
            team_two[player.steam] = player.name;
            players.push(player.id);
          });

          axios.post(`/match/start`, {
            ip: ip,
            port: port,
            team_one: team_one,
            team_two: team_two
          })
            .then(response => {
              // const {match_id} = data;

              players.map(playerId => {
                client.fetchUser(playerId)
                  .then(user => {
                    user.send(`Please connect to the server:\n\`connect ${ip}:${port}\``);
                  });
              });
            })
            .catch(error);
        } else {
          console.log('Oh snap! There isn\'t an empty server to join!');
        }
      });
  },
  sendAwaitConfirmation: (client, matchId) => {
    const match = require('./match');
    const players = match.getPlayers(matchId);

    players.map(player => {
      queue.setConfirmable(player.id, true);

      client.users.find(x => x.id === player.id).send({
        embed: {
          author: {
            name: client.user.username,
            icon_url: client.user.avatarURL
          },
          color: Number(config.colour),
          description: `Please confirm the match inside by typing \`${config.prefix}ready\` in the #${config.queue_text_channel} text channel. You have ${(config.match_confirmation_timer / 1000)} seconds.`
        }
      })
    });
  },
  initialize: (client, players) => {
    //GET THE ELO. AND SETUP TEAMS.
    let team1 = [];
    let team2 = [];

    let json = {
      hasStarted: false,
      hasEnded: false,
      allPlayersConfirmed: false,
      team1: team1,
      team2: team2
    };

    let alreadyInMatch = [];
    players.map(player => {
      if (match.findMatchId(player.id)) {
        alreadyInMatch.push(player);
      }
    });

    if (alreadyInMatch.length > 0) {
      return;
    }

    let playersEloSorted = [];
    for (let i = 0; i < players.length; i++) {
      playersEloSorted.push(players[i].score);
    }

    playersEloSorted = playersEloSorted.sort();

    for (let i = 0; i < playersEloSorted.length; i += 2) {
      team1.push(players.find(player => player.score === playersEloSorted[i]));
    }

    for (let i = 1; i < playersEloSorted.length; i += 2) {
      team2.push(players.find(player => player.score === playersEloSorted[i]));
    }

    json.team1 = team1;
    json.team2 = team2;

    //I NEED TO ADD SUPPORT FOR MULTIPLE GAMES LATER DOWN THE ROAD YES I KNOW.
    // const matchId = generateMatchId(10);
    const matchId = `match-${cache.size()}`;
    cache.set(matchId, json);
    queueTimer.startReadyTimer(config.match_confirmation_timer, matchId, client);

    return matchId;
  },
  changePlayerReadyStatus: (playerId, ready, client) => {
    const match = require('./match');
    console.log('should be setting ready status');

    const matchId = match.findMatchId(playerId);
    console.log(matchId);
    match.get(matchId)
      .then(matchData => {
        let hasAllPlayerConfirmed = matchData.team1.length > 0 || matchData.team2.length > 0;
        matchData.team1.map(item => {
          if (item.id === playerId) {
            item.confirmed = ready;
          }

          if (!item.confirmed) {
            hasAllPlayerConfirmed = false;
          }
        });

        if (hasAllPlayerConfirmed) {
          matchData.team2.map(item => {
            if (item.id === playerId) {
              item.confirmed = ready;
            }

            if (!item.confirmed) {
              hasAllPlayerConfirmed = false;
            }
          });
        }

        matchData.allPlayersConfirmed = hasAllPlayerConfirmed;

        console.log('setting match data');
        console.log(matchData);
        match.set(matchId, matchData);

        if (matchData.allPlayersConfirmed) {
          console.log('All players have confirmed.');

          let team1Message = '';
          matchData.team1.map(player => {
            team1Message += `<@${player.id}> | \`${player.score} points\`\n`;
          });

          let team2Message = '';
          matchData.team2.map(player => {
            team2Message += `<@${player.id}> | \`${player.score} points\`\n`;
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
      });
  }
};
