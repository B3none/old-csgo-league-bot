const cache = require('node-file-cache').create({
  file: `${process.cwd()}/app/data/queue.json`,
  life: 240
});

module.exports = {
  get: async () => {
    return cache.get('queue') || [];
  },
  add: player => {
    const queueData = cache.get('queue') || [];
    queueData.map((queuePlayer, index) => {
      if(queuePlayer.id === player.id) queueData.splice(index, 1);
    });
    queueData.push(player);

    cache.set('queue', queueData);

    return queueData;
  },
  remove: discordId => {
    const queueData = cache.get('queue') || [];
    let didRemove = false;

    queueData.map((item, index) => {
      if (item.id === discordId) {
        queueData.splice(index, 1);
        didRemove = true;
      }
    });

    cache.set('queue', queueData);

    return {
      queue: queueData,
      didRemove
    };
  },
  setConfirmable: (player, confirmable) => {
    const queueData = cache.get('queue') || [];

    queueData.map(item => {
      if (item.id === player) {
        item.confirmable = confirmable;
      }
    });

    cache.set('queue', queueData);

    return {
      queue: queueData,
    };
  },
  setConfirmed: (player, confirmed) => {
    const queueData = cache.get('queue') || [];

    queueData.map(item => {
      if (item.id === player) {
        item.confirmed = confirmed;
      }
    });

    cache.set('queue', queueData);

    return {
      queue: queueData,
    };
  },
  reset: () =>  {
    cache.set('queue', undefined);
  },
};