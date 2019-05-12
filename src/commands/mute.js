const path = require('path');
const time = require('../helpers/time');
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
    description: `A command to temporarily mute a user in discord for a period of time.`,
    usage: `${config.prefix}mute @member <duration|seconds>`,
    command: (client, message, args) => {
        let finalMessage;

        // Getting our user
        const user = message.mentions.members.first() || message.guild.members.get(args[0]);
        const [userTag, duration = 3600] = args;

        // Validating arguments
        if (!user) {
            finalMessage = "Invalid User. Please make sure that you @ a valid user who is in the server.";
        } else if (user.serverMute) {
            finalMessage = `${userTag} is already muted by the server.`;
        } else if (isNaN(duration)) {
            finalMessage = `Wrong usage. To mute a member, use ${module.exports.usage}.`;
        } else if(duration <= 0) {
            finalMessage = `Invalid duration. The duration must be greater than 0.`;
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

        // Mute the user and handle the response
        user.setMute(true)
            .then(() => {
                finalMessage = `${userTag} has been muted for ${time.prettifySeconds(duration)}.`;
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

                // Unmute the user after the duration specified
                setTimeout(() => {
                    // If the user has been unmuted in this time, don't do anything
                    if (!user.serverMute) {
                        return;
                    }

                    user.setMute(false);
                    message.author.send({
                        embed: {
                            author: {
                                name: client.user.username,
                                icon_url: client.user.avatarURL
                            },
                            color: 3447003,
                            description: `${userTag} has now been unmuted.`
                        }
                    });
                }, duration * 1000);
            })
            .catch(e => {
                finalMessage = `${e.name}: ${e.message} [${e.code}]`;

                // Custom response for missing permissions
                if (e.message === 'Missing Permissions') {
                    finalMessage = `I cannot mute ${userTag}! Do they have a higher role? Do I have mute permissions?`;
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