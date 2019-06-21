// const Discord = require('discord.js');
// const client = new Discord.Client();
// const config = require('../app/config');
// const messageHelper = require('./helpers/message');
// const matchMaker = require('./helpers/matchmaker.js');

// client.on('ready', () => {
//     console.log(`The League Discord Bot has been started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
//     matchMaker.setupQueueingChannels(client);
//     client.user.setActivity(config.url.replace(/(^\w+:|^)\/\//, ''));
// });

// client.on('message', message => messageHelper.message(client, config.prefix, message));
// client.on('voiceStateUpdate', (oldMember, newMember) => matchMaker.channelUpdate(oldMember, newMember, client));

// client.login(config.token);

const config = require("../app/config");
const token = config.token;
const Discord = require("discord.js");
let matchMaker = require("./helpers/matchMaker");
let matchMakerInstance = new matchMaker();

function displayGame(matchDetails) {
    let resultMessage;
    resultMessage = "\n** Game details:**\n";
    resultMessage += JSON.stringify(matchDetails, null, "\t");
    return resultMessage;
};

const join = (request) => {
    let promise = new Promise(function (resolve, reject) {
        let resultMessage = "";
        matchMakerInstance.join(request.user, request.data).then(function (insertResult) {
            if (insertResult.addedPlayer) {
                resultMessage += request.user + " has joined the queue.";
            }
            else {
                resultMessage += request.user + " is already in queue.";
            }

            if (insertResult.matchDetails) {
                resultMessage += displayGame(insertResult.matchDetails);
            }
            resolve(resultMessage);

        }).catch(function (errorMessage) {
            resultMessage = request.user + " has failed to join the queue because " + errorMessage;
            resolve(resultMessage);

        });
    });

    return promise;
}

const leave = (request) => {
    let promise = new Promise(function (resolve, reject){
        var removed = matchMakerInstance.leave(request.user, request.data);
        resolve((removed.length > 0 ? request.user + " has left the queue successfully." : null));
    });
    return promise;
}

module.exports = function() {
    const client = new Discord.Client();
    let lastChannel = null;
    let isBotConnected = false;

    client.on('ready', () => {
        console.log(`The League Discord Bot has been started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
    });

    client.login(token).then(function () {
        isBotConnect = true;
    });

    client.on()
}
