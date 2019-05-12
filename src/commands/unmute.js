const path = require('path');
const config = require("../../config/config.json");

module.exports = {
    aliases: [path.basename(__filename).split('.')[0]],
    permissions: [
        '500773302751723530', // Developer
        '467659999297011712', // Founder
        '476853786850099200', // General Manager
        // '480125110099902465' // Local - "sexy blonde"
    ],
    disabled: false,
    description: `A command to unmute a user who has previously been muted.`,
    usage: `${config.prefix}unmute @member`,
    command: (client, message, args) => {
        let finalMessage;

        // Getting our user
        const [userTag] = args;
        const user = message.mentions.members.first() || message.guild.members.get(userTag);

        // Validating arguments
        if (!user) {
            finalMessage = "Invalid User. Please make sure that you @ a valid user who is in the server.";
        } else if (!user.serverMute) {
            finalMessage = `${userTag} is not currently muted by the server.`;
        }

        // If we've had an error, display it and stop
        if (finalMessage) {
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
            return;
        }

        // Unmute the user and handle the response
        user.setMute(false)
            .then(() => {
                finalMessage = `${userTag} has been unmuted.`;
                message.author.send({
                    embed: {
                        author: {
                            name: client.user.username,
                            icon_url: client.user.avatarURL
                        },
                        color: 3447003,
                        description: finalMessage
                    }
                });
            })
            .catch(e => {
                finalMessage = `${e.name}: ${e.message} [${e.code}]`;

                // Custom response for missing permissions
                if (e.message === 'Missing Permissions') {
                    finalMessage = `I cannot unmute ${userTag}! Do they have a higher role? Do I have mute permissions?`;
                }

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
            });

        message.delete().catch(O_o => {});
    }
};