const path = require('path');

const version = require('../../package.json').version;

module.exports = {
    aliases: [path.basename(__filename).split('.')[0], 'versoin'],
    permissions: [],
    disabled: false,
    description: "Displays the current version of the bot.",
    command: (client, message) => {
        message.channel.send({
            embed: {
                author: {
                    name: client.user.username,
                    icon_url: client.user.avatarURL
                },
                color: 0xff8c00,
                description: `I am currently on version \`${version}\``
            }
        });
    }
};
