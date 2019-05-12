const config = require('../../config');
const path = require('path');

module.exports = {
    aliases: [path.basename(__filename).split('.')[0], 'sy'],
    permissions: [
        '500773302751723530', // Developer
        '467659999297011712', // Founder
        '476853786850099200', // General Manager
        // '480125110099902465' // Local - "sexy blonde"
    ],
    disabled: false,
    description: "A command to mass DM a specific group in discord.",
    command: (client, message, args) => {
        let finalMessage = 'Please make sure that you @ a group before the message body.';

        if (args[0].slice(0, 3) === '<@&') {
            let roleId = args[0].replace('<@&', '').replace('>', '');

            args.shift();

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
            message.guild.members.map(member => {
                if (!member.bot
                    && member._roles.indexOf(roleId) !== -1 
                    && message.author.id !== member.id) {
                    member.send(`${args.join(' ')} | Message from <@${message.author.id}>`);
                    sentMessages++;
                }
            });

            finalMessage = 'Message sent to ';

            if (sentMessages === 0) {
                finalMessage += 'nobody.';
            } else if (sentMessages === 1) {
                finalMessage += '1 user.';
            } else if (sentMessages > 1) {
                finalMessage += sentMessages + ' users.';
            }
        }

        message.delete().catch(O_o => {});
        message.author.send({
            embed: {
                author: {
                    name: client.user.username,
                    icon_url: client.user.avatarURL
                },
                color: Number(config.colour),
                description: finalMessage
            }
        });
    }
};