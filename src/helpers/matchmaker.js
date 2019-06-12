let config = require('../../app/config.json');
let queue = require('../helpers/queue.js');
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
    channelUpdate: (oldMember, newMember) => {
        let newUserChannel = newMember.voiceChannel
        let oldUserChannel = oldMember.voiceChannel
        if(oldUserChannel === undefined && newUserChannel !== undefined) {
            // User Joins a voice channel so add him to the queue.
            queue.add(newUserChannel.id);
         } else if(newUserChannel === undefined){
           // User leaves a voice channel so remove him from queue.
           queue.remove(oldUserChannel.id);
         }
    }
};