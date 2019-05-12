const path = require('path');

module.exports = {
    aliases: [path.basename(__filename).split('.')[0], 'filp'],
    permissions: [],
    disabled: false,
    description: "Flip a coin and see the result.",
    command: (client, message) => {
        message.channel.send({
            embed: {
                author: {
                    name: client.user.username,
                    icon_url: client.user.avatarURL
                },
                color: 0xff8c00,
                description: `You got ${Math.random() > 0.5 ? 'Heads!' : 'Tails!'}`
            }
        });
    }
};
