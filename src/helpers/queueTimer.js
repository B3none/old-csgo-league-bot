const cache = require('node-file-cache').create({
  file: `${process.cwd()}/app/data/matches.json`,
  life: 240
});

module.exports = {
  startReadyTimer: (ms, match) => {
    setTimeout(() => {
      const matchData = cache.get(match) || [];

      if (!matchData.allPlayersConfirmed) {
        console.log("All players haven't accepted.");
        cache.expire(match);
      }
    }, ms)
  }
};