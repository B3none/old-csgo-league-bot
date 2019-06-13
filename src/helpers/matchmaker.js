let config = require('../../app/config.json');
let queue = require('./queue.js');
let channels = require('./channels');
let game = require('./game');
let fs = require('fs');
const axiosHelper = require('./axios');
const axios = axiosHelper.get();

module.exports = {
    setupQueueingChannel: (client) => { 
        //SETUP TEXT CHANNEL & voice channel
        channels.checkChannels(client);
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

        if(oldUserChannel === undefined && newUserChannel !== undefined && newMember.id !== client.user.id){
            //GET THE PLAYERS ELO FROM THE DATABASE.
            axios.get(`/player/discord/${newMember.id}`)
              .then(function (response) {
                queue.add({id: newMember.id, confirmed: false, confirmable: false, name: newMember.user.username, steam: response.data.steam, elo: response.data.elo});
                //CHECK IF THERE ARE 10 peoples inside a voice channel
                queue.get()
                .then(players => {
                    console.log(players);
                    if(players.length === config.playerInAMatch){
                        console.log('Reached enough players to start a game, sending confirmation requests.');
                        game.initialize(players);
                        game.sendAwaitConfirmation(client, players);
                    }
                });  
            })
              .catch(function (error) {
                console.log('Something went wrong: ', error);
            })
        }
        else if(newUserChannel === undefined) queue.remove(oldUserChannel.id);



    },
    
};