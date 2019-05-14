const config = require('../../config');
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
                color: Number(config.colour),
                description: `I am currently on version \`${version}\``
            }
        });
    }
};
