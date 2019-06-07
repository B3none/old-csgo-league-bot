const queueHelper = require('./queue');
const readyHelper = require('./ready');

const readyCheck = queue => {
  for (let i = 0; i <= 9; i++) {
    // TODO: Figure out a way of getting a mean elo to get a fair game.
    readyHelper.checkClientReady(queue[i]);
  }
};

module.exports = async () => {
  const queue = queueHelper.get();

  if (queue.length >= 10) {
    readyCheck(queue);
  }
};