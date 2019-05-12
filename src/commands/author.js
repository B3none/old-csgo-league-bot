const path = require('path');

const authors = require('../../package.json').contributors;

module.exports = {
    aliases: [path.basename(__filename).split('.')[0], 'authors'],
    permissions: [],
    disabled: false,
    description: "Displays the authors of the discord bot.",
    command: (client, message) => {
        let fields = [];

        authors.map(author => {
            fields.push({
                name: author.name,
                value: author.github
            });
        });

        message.channel.send({
            embed: {
                author: {
                    name: client.user.username,
                    icon_url: client.user.avatarURL
                },
                color: 0xff8c00,
                description: `My creators are:`,
                fields: fields
            }
        });
    }
};
