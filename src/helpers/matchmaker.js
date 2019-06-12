let config = require('../../app/config.json');
let queue = require('../helpers/queue.js');
let game = require('./startGame');
let fs = require('fs');
module.exports = {
    setupQueueingChannel: (client) => { 
        //SETUP TEXT CHANNEL & voice channel
        client.guilds.map((guild) => {
            if(!guild.channels.find(x => x.name === config.queuechanneltext.toString().toLowerCase())){  
                guild.createChannel(config.queuechanneltext, { type: 'text' }) 
                .then(console.log("Created a channel for the queue"))
                .catch(console.error); 
            }

            if(!guild.channels.find(x => x.name === config.queuechannelvoice.toString().toLowerCase())){  
                guild.createChannel(config.queuechannelvoice, { type: 'voice' }) 
                .then(() => {
                    let channelid = client.channels.find(x => x.name === config.queuechannelvoice.toString().toLowerCase()).id;
                    fs.writeFile(`${process.cwd()}/app/data/voicechannels.json`, JSON.stringify({queueChannelID: channelid}), (err) => {if(err)throw(err)});
                })
                .catch(console.error);  
            }

        });
        //RESET QUEUE
        queue.reset();
    },
    joinedQueuingChannel: (client) => {
        fs.readFile(`${process.cwd()}/app/data/voicechannels.json`, 'utf-8',(err, data) => {
            if(err) throw err;
            let channelToJoin = client.channels.get(JSON.parse(data).queueChannelID.toString());
            channelToJoin.join()
            .then(connection => console.log('Bot connected to the queuing voice channel!'))
            .catch(console.error);
        })
    },
    channelUpdate: (oldMember, newMember, client) => {
        let newUserChannel = newMember.voiceChannel
        let oldUserChannel = oldMember.voiceChannel
        if(oldUserChannel === undefined && newUserChannel !== undefined) queue.add({id: newMember.id, confirmed: false, confirmable: false, name: newMember.name});
        else if(newUserChannel === undefined) queue.remove(oldUserChannel.id);

        //CHECK IF THERE ARE 10 peoples inside a voice channel
        queue.get()
        .then(players => {
            if(players.length === config.playerInAMatch){
                console.log("Reached enough players to start a game, sending confirmation requests.");
                game.sendAwaitConfirmation(client, players);
            }
        });
        
    },
    
};