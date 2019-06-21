// const cache = require('node-file-cache').create({
//   file: `${process.cwd()}/app/data/queue.json`
// });

// const match = require('./match');

// module.exports = {
//   get: async () => {
//     return cache.get('queue') || [];
//   },
//   add: player => {
//     const matchId = match.findMatchId(player.id);
//     if (matchId) {
//       console.log(matchId);
//       return matchId;
//     }

//     const queueData = cache.get('queue') || [];

//     queueData.map((queuePlayer, index) => {
//       if (queuePlayer.id === player.id) {
//         queueData.splice(index, 1);
//       }
//     });
//     queueData.push(player);

//     cache.set('queue', queueData);

//     return false;
//   },
//   remove: discordId => {
//     const queueData = cache.get('queue') || [];
//     let didRemove = false;

//     queueData.map((item, index) => {
//       if (item.id === discordId) {
//         queueData.splice(index, 1);
//         didRemove = true;
//       }
//     });

//     cache.set('queue', queueData);

//     return {
//       queue: queueData,
//       didRemove
//     };
//   },
//   setConfirmable: (player, confirmable) => {
//     const queueData = cache.get('queue') || [];

//     queueData.map(item => {
//       if (item.id === player) {
//         item.confirmable = confirmable;
//       }
//     });

//     cache.set('queue', queueData);

//     return {
//       queue: queueData,
//     };
//   },
//   setConfirmed: (player, confirmed) => {
//     const queueData = cache.get('queue') || [];

//     queueData.map(item => {
//       if (item.id === player) {
//         item.confirmed = confirmed;
//       }
//     });

//     cache.set('queue', queueData);

//     return {
//       queue: queueData,
//     };
//   },
//   reset: () =>  {
//     cache.set('queue', undefined);
//   },
// };

const config = require('../../app/config.json');
const _ = require("lodash");
const shuffle = require("shuffle-array");
const PLAYERS_PER_MATCH = config.players_per_match;

class QueueManager {
  constructor() {
    this.waitingQueue = [];
  }

  getQueueSize() {
    return this.waitingQueue.length;
  }

  getWaitingQueue() {
    return [].concat(this.waitingQueue);
  }

  getGameGroup() {
    let gameGroupResult = null;
    if (this.getQueueSize() >= PLAYERS_PER_MATCH) {
      gameGroupResult = this.waitingQueue.slice(0, PLAYERS_PER_MATCH);
      this.waitingQueue = this.waitingQueue.slice(PLAYERS_PER_MATCH + 1, this.waitingQueue.length);
    }

    return gameGroupResult;
  }

  addPlayerToQueue(addPlayerData) {
    return new Promise(resolve, reject => {
      let addedPlayerResult = null;

      let playerExist = _.findIndex(this.waitingQueue, function (player) {
        return player.discordTag == addPlayerData.discordTag;
      });

      if (playerExist < 0) {
        addedPlayerResult = true;

        
      }
    })
  }

  removePlayerFromQueue(discordUser) {
    return _.remove(this.waitingQueue, function (user) {
      return user.discordTag == discordUser.discordTag;
    });
  }
}

module.exports = QueueManager;