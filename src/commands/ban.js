const path = require('path');
const time = require('../helpers/time');
const config = require("../../config/config.json");

module.exports = {
    aliases: [path.basename(__filename).split('.')[0]],
    permissions: [
        '500773302751723530', // Developer
        '467659999297011712', // Founder
        '476853786850099200', // General Manager
    ],
    disabled: false,
    description: `A command to temporarily ban a user from the discord server for a period of time.`,
    usage: `${config.prefix}ban @member <duration|seconds> <reason>`,
    command: async (client, message, args) => {
        let finalMessage;

        // Retrieve our arguments
        const userTag = args.shift(),
            plainUserTag = userTag.replace('<@', '').replace('>', '');
            duration = args.shift(),
            user = message.guild.members.get(plainUserTag);

        // Get the ban reason
        let reason = "No reason provided";
        if (args.length) {
            reason = args.join(' ');
        }

        // Validating arguments
        if (!user) {
            finalMessage = "Invalid User. Please make sure that you @ a valid user who is in the server.";
        } else if (!user.bannable) {
            finalMessage = `I cannot ban ${userTag}! Do they have a higher role? Do I have ban permissions?`;
        } if (isNaN(duration)) {
            finalMessage = `Wrong usage. To ban a member, use ${module.exports.usage}.`;
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

        // Inform the user of their banning & ban them
        const displayDuration = time.prettifySeconds(duration);
        await user.send({
            embed: {
                author: {
                    name: client.user.username,
                    icon_url: client.user.avatarURL
                },
                color: 0xff8c00,
                description: `You have been banned from the nerdRage discord server by ${message.author.tag} for ${displayDuration}, for reason: ${reason}.`
            }
        }).catch(O_o => {});

        const user_id = user.id;
        message.guild.ban(user, reason)
            .then(() => {
                finalMessage = `${userTag} has been banned by ${message.author.tag} for ${displayDuration}, for reason: ${reason}.`;
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

                // Unban the user after the duration specified
                setTimeout(async () => {
                    let unbanned = true;
                    await message.guild.fetchBans()
                                    .then(bans => {
                                        bans.map(ban => {
                                            if (user_id === ban.id) {
                                                unbanned = false
                                            }
                                        });
                                    })
                                    .catch(O_o => {});

                    // If the user has been unbanned in this time, don't do anything
                    if (unbanned) {
                        return;
                    }

                    message.guild.unban(user_id);
                    message.author.send({
                        embed: {
                            author: {
                                name: client.user.username,
                                icon_url: client.user.avatarURL
                            },
                            color: 3447003,
                            description: `${userTag} has been unbanned after ${displayDuration}.`
                        }
                    });
                }, duration * 1000);
            })
            .catch(e => {
                finalMessage = `${e.name}: ${e.message} [${e.code}]`;
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