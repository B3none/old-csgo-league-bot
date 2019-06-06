const cache = require('node-file-cache').create({
  file: '/../../app/data/queue.json',
  life: 240
});

module.exports = {
  get: async () => {
    return cache.get('queue');
  },
  add: discordId => {
    const queueData = cache.get('queue');
    queueData.push(discordId);

    cache.set('queue', queueData);
    return queueData;
  },
  remove: discordId => {
    const queueData = cache.get('queue');
    const index = queueData.indexOf(discordId);

    if (index > -1) {
      delete queueData[index];
    }

    cache.set('queue', queueData);
    return queueData;
  }
};