const getMatchesCache = () => require('node-file-cache').create({
  file: `${process.cwd()}/app/data/matches.json`,
  life: 240
});

const getRawMatches = () => require('/app/data/matches');

module.exports = {
  get: async matchId => {
    const cache = getMatchesCache();
    return cache.get(matchId) || {
      team1: [],
      team2: []
    };
  },
  getPlayers: matchId => {
    const cache = getMatchesCache();
    const matchData = cache.get(matchId) || {
      team1: [],
      team2: []
    };

    console.log(matchId);
    console.log(matchData);

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
    console.log(playerId);
    const rawMatches = getRawMatches() || {};

    console.log('all-matches');
    console.log(rawMatches);
  }
};