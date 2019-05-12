const config = require('/config/config');
const path = require('path');
const guildHelper = require('../helpers/guild');

module.exports = {
    aliases: [path.basename(__filename).split('.')[0], 'server'],
    permissions: [],
    disabled: false,
    description: "Show information about the server.",
    command: (client, message) => {
        let guild = message.guild;

        [createdMonth, createdDay, createdYear] = guild.createdAt.toLocaleDateString('en').split('/');

        let fields = [
            {
                name: 'Channels',
                value: guildHelper.getChannelCount(guild),
                inline: true
            },
            {
                name: 'Roles',
                value: guild.roles.size,
                inline: true
            },
            {
                name: 'Server region',
                value: guild.region,
                inline: true
            },
            {
                name: 'Members',
                value: guildHelper.getMemberCount(guild),
                inline: true
            },
            {
                name: 'Server created',
                value: `${createdDay}/${createdMonth}/${createdYear}`,
                inline: true
            },
            {
                name: 'Server ID',
                value: guild.id,
                inline: true
            },
            {
                name: 'Verified server?',
                value: guild.verified ? 'Yes' : 'No',
                inline: true
            },
            {
                name: 'Owner',
                value: `${guild.owner.displayName} #${guild.owner.user.discriminator}`,
                inline: true
            },
            {
                name: 'Server acronym',
                value: guild.nameAcronym,
                inline: true
            },
            {
                name: 'Custom emojis',
                value: guild.emojis.size,
                inline: true
            },
        ];

        message.channel.send({
            embed: {
                author: {
                    name: client.user.username,
                    icon_url: client.user.avatarURL
                },
                color: config.colour,
                description: `Server information:`,
                fields: fields
            }
        });
    }
};
