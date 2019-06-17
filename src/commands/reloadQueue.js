const config = require('../../app/config');
const path = require('path');
const matchmaker = require('../helpers/matchmaker');
module.exports = {
  aliases: [path.basename(__filename).split('.')[0], 'rq'],
  permissions: [],
  description: 'Reload the queue',
  command: (client, message) => {
    matchmaker.reloadQueue(client);
    message.channel.send({
      embed: {
        author: {
          name: client.user.username,
          icon_url: client.user.avatarURL
        },
        color: Number(config.colour),
        description: `Reloaded the queue.`
      }
    });
  }
};
