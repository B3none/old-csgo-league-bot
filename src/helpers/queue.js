const cache = require('node-file-cache').create({
  file: `${process.cwd()}/app/data/queue.json`,
  life: 240
});

module.exports = {
  get: async () => {
    return cache.get('queue') || [];
  },
  add: discordId => {
    const queueData = cache.get('queue') || [];
    queueData.push(discordId);

    cache.set('queue', queueData);
    return queueData;
  },
  remove: discordId => {
    const queueData = cache.get('queue') || [];
    const index = queueData.indexOf(discordId);
    let didRemove = false;

    if (index > -1) {
      queueData.splice(index, 1);
      didRemove = true;
    }
    cache.set('queue', queueData);
    return {
      queue: queueData,
      didRemove
    };
  },
  reset: () =>  {
    cache.clear();
  }
};