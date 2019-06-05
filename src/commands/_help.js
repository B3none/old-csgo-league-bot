const config = require('../../app/config');
const permissions = require('../helpers/permissions');

const normalizedPath = require('path').join(__dirname, '/');

let commands = [];

require('fs').readdirSync(normalizedPath).map(file => {
    if (file !== '_help.js') {
        commands.push(require(`./${file}`));
    }
});

module.exports = {
    aliases: ['help', 'hlep'],
    permissions: [],
    disabled: false,
    description: 'Prints a list of all available commands and their description.',
    command: (client, message) => {
        message.delete().catch(O_o => {});

        let fields = [];
        commands.map(command => {
            if (!command.disabled && permissions.hasPermission(command, message)) {
                // Build the help text
                let name = `**${config.prefix}${command.aliases[0]}**`;

                // Use the command's usage as the name instead if we have it
                if (command.usage) {
                    name = `**${command.usage}**`;
                }

                const value = command.description || 'This command does not have a description.';

                fields.push({
                    name: name,
                    value: value
                });
            }
        });

        message.author.send({
            embed: {
                author: {
                    name: client.user.username,
                    icon_url: client.user.avatarURL
                },
                color: Number(config.colour),
                title: 'Help command',
                description: module.exports.description,
                fields: fields
            }
        });
    }
};
