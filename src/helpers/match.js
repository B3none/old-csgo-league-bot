const fs = require('fs');

const getMatchesCache = () => require('node-file-cache').create({
  file: `${process.cwd()}/app/data/matches.json`
});

const getRawMatches = () => fs.readFileSync(`${process.cwd()}/app/data/matches.json`);

module.exports = {
  get: async matchId => {
    const cache = getMatchesCache();
    return cache.get(matchId) || {
      team1: [],
      team2: []
    };
  },
  set: async (matchId, match) => {
    const cache = getMatchesCache();
    return cache.set(matchId, match);
  },
  getPlayers: matchId => {
    const cache = getMatchesCache();
    const matchData = cache.get(matchId) || {
      team1: [],
      team2: []
    };

    let players = [];
    matchData.team1.map(player => {
      players.push(player);
    });
    matchData.team2.map(player => {
      players.push(player);
    });

    return players;
  },
  findMatchId: playerId => {
    const raw = getRawMatches();
    const {index} = JSON.parse(raw) || {
      index: []
    };

    if (!index || !index.length) {
      return false;
    }

    let matchId = false;
    let foundPlayer = false;
    index.map(match => {
      if (match && match.val) {
        matchId = match.key;
        match = match.val;

        if (match.team1) {
          match.team1.map(player => {
            if (!foundPlayer && player.id === playerId) {
              foundPlayer = true;
            }
          });
        }

        if (match.team2) {
          match.team2.map(player => {
            if (!foundPlayer && player.id === playerId) {
              foundPlayer = true;
            }
          });
        }

        if (!foundPlayer) {
          matchId = false;
        }
      }
    });

    return matchId;
  },
  end: async matchId => {
    const file = getRawMatches();

    if (!file.index || !file.index.length) {
      return;
    }

    file.index.filter(match => {
      if (match && match.key) {
        return matchId !== match.key;
      }
    });

    const contents = JSON.stringify(file);
    fs.writeFile(`${process.cwd()}/app/data/matches.json`, contents, error);
  }
};