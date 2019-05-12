const Discord = require('discord.js');

const client = new Discord.Client();

const config = require('../config.json');

const guildHelper = require('./helpers/guild');
const messageHelper = require('./helpers/message');

client.on('ready', () => {
    console.log(`nerdRage's Discord Bot has been started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
    client.user.setActivity(require('../package.json').version);
});

client.on('guildCreate', guild => guildHelper.guildCreate(guild));

client.on('guildDelete', guild => guildHelper.guildDelete(guild));

client.on('guildMemberAdd', member => guildHelper.welcome(member));

client.on('guildMemberRemove', member => guildHelper.unwelcome(member));

client.on('message', message => messageHelper.message(client, config.prefix, message));

client.login(config.token);