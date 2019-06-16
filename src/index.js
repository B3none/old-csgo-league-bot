const Discord = require('discord.js');

const client = new Discord.Client();

const config = require('../app/config');

const messageHelper = require('./helpers/message');

const matchMaker = require('./helpers/matchmaker.js');

client.on('ready', () => {
    console.log(`The League Discord Bot has been started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
    matchMaker.setupQueueingChannel(client);
    client.user.setActivity(require('../package.json').version);
});

client.on('message', message => messageHelper.message(client, config.prefix, message));
client.on('voiceStateUpdate', (oldMember, newMember) => matchMaker.channelUpdate(oldMember, newMember, client));

client.login(config.token);