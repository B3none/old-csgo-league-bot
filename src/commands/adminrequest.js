const path = require('path');

const moderatorRoleId = '498516884744830977';

module.exports = {
    aliases: [path.basename(__filename).split('.')[0], 'arq'],
    permissions: [],
    disabled: false,
    description: "A command to let a moderator know that you require help.",
    command: (client, message, args) => {
        if (!args.join(' ').length) {
            message.delete().catch(O_o => {});
            message.author.send({
                embed: {
                    author: {
                        name: client.user.username,
                        icon_url: client.user.avatarURL
                    },
                    color: 0xff8c00,
                    description: 'Please add a message body.'
                }
            });

            return;
        }

        let sentMessages = 0;
        let guildMembers = message.guild.members || [];
        guildMembers.map(member => {
            if (!member.bot
                && member._roles.indexOf(moderatorRoleId) !== -1
                && message.author.id !== member.id) {
                member.send(`${args.join(' ')} | Help request from <@${message.author.id}>`);
                sentMessages++;
            }
        });

        let finalMessage = 'Message sent to ';

        if (sentMessages === 0) {
            finalMessage += 'nobody.';
        } else {
            finalMessage += `${sentMessages} moderator${sentMessages > 1 && 's'}.`;
        }

        message.delete().catch(O_o => {});
        message.author.send({
            embed: {
                author: {
                    name: client.user.username,
                    icon_url: client.user.avatarURL
                },
                color: 0xff8c00,
                description: finalMessage
            }
        });
    }
};