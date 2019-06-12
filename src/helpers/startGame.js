const queue = require('./queue.js');
const config = require('../../app/config');
module.exports = {
    sendAwaitConfirmation: (client) => {
        let team1 = [];
        let team2 = [];
        queue.get()
        .then(players => {
            players.map((player, index) => {
                queue.setConfirmable(player.id, true);
                client.users.find(x => x.id == player.id).send({
                    embed: {
                      author: {
                        name: client.user.username,
                        icon_url: client.user.avatarURL
                      },
                      color: Number(config.colour),
                      description: `Please confirm the match inside by typing ${config.prefix}ready inside the confirm-match text channel.`
                    }
                  })
            });
        });
    }
}