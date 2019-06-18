const getMatchesCache = () => require('node-file-cache').create({
  file: `${process.cwd()}/app/data/matches.json`
});

const getRawMatches = () => require(`${process.cwd()}/app/data/matches`);

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
    const { index } = getRawMatches() || {
      index: []
    };

    let matchId = false;
    let foundPlayer = false;
    index.map(match => {
      if (matchId === -1 && match && match.val) {
        matchId = match.key;
        match = match.val;

        match.team1.map(player => {
          if (!foundPlayer && player.id === playerId) {
            foundPlayer = true;
          }
        });
        match.team2.map(player => {
          if (!foundPlayer && player.id === playerId) {
            foundPlayer = true;
          }
        });

        if (!foundPlayer) {
          matchId = false;
        }
      }
    });

    return matchId;
  },
  end: async matchId => {
    const cache = getMatchesCache();
    cache.set(matchId, {});
  }
};