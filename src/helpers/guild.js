module.exports = {
    guildCreate: guild => {
        console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${module.exports.getMemberCount(guild)} members!`);
    },
    guildDelete: guild => {
        console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
    },
    welcome: (client, member) => {
        if (!member) {
            return;
        }
        const serverDoor = member.guild.channels.find(channel => (channel.id == '467658040141807627' || channel.id == '501034610688262164'));

        if (!serverDoor) {
            return;
        }

        serverDoor.send({
            embed: {
                author: {
                    name: client.user.username,
                    icon_url: client.user.avatarURL
                },
                color: 0xff8c00,
                description: `Welcome to the nerdRage Discord, ${member}! Please check #welcome and #nrgl-announcements for the latest news regarding our tournaments! There are now \`${module.exports.getMemberCount(member.guild)}\` on this Discord.`
            }
        });
        member.send({
            embed: {
                author: {
                    name: client.user.username,
                    icon_url: client.user.avatarURL
                },
                color: 0xff8c00,
                description: 'Thanks for becoming a part of our excellent community.'
            }
        });
    },
    unwelcome: (client, member) => {
        if (!member) {
            return;
        }

        const serverDoor = member.guild.channels.find(channel => (channel.id == '467658040141807627' || channel.id == '501034610688262164'));

        if (!serverDoor) {
            return;
        }

        serverDoor.send({
            embed: {
                author: {
                    name: client.user.username,
                    icon_url: client.user.avatarURL
                },
                color: 0xff8c00,
                description: `Goodbye ${member}. There are now \`${module.exports.getMemberCount(member.guild)}\` members in the server.`
            }
        });
    },
    getChannelCount: guild => guild.channels.filter(channel => channel.type !== 'category').size,
    getMemberCount: guild => guild.members.filter(channel => channel.type !== 'bot').size
};