const Discord = require('discord.js');

const client = new Discord.Client();

const config = require('../app/config.json');

const messageHelper = require('./helpers/message');

client.on('ready', () => {
    console.log(`The League Discord Bot has been started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
    client.user.setActivity(require('../package.json').version);
});

client.on('message', message => messageHelper.message(client, config.prefix, message));

client.login(config.token);