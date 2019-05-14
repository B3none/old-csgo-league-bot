const config = require('../../config');
const normalizedPath = require('path').join(__dirname, '/../commands');

let commands = [];

require('fs').readdirSync(normalizedPath).map(file => {
    commands.push(require(`../commands/${file}`));
});

const permissions = require('./permissions');

module.exports = {
    message: (client, prefix, message) => {
        if (!message.author.bot && message.channel.type === 'dm') {
            return message.author.send({
                embed: {
                    author: {
                        name: client.user.username,
                        icon_url: client.user.avatarURL
                    },
                    color: Number(config.colour),
                    description: `Sorry! I don't respond to messages like this! Please go back into our Discord server and type \`!help\` to see the commands that I use!`
                }
            });
        }

        if (message.author.bot || message.content.indexOf(prefix) !== 0) {
            return;
        }

        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        const command = args.shift().toLowerCase();

        commands.map(v => {
            if (!v.disabled && v.aliases.indexOf(command) >= 0) {
                if (permissions.hasPermission(v, message)) {
                    return v.command(client, message, args);
                }

                return message.author.send({
                    embed: {
                        author: {
                            name: client.user.username,
                            icon_url: client.user.avatarURL
                        },
                        color: Number(config.colour),
                        description: `You do not have permission to use the ${command} command.`
                    }
                });
            }
        });
    }
};