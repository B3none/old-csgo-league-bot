let queueingChannel = null;
let config = require('../../app/config.json');

module.exports = {
    setupQueueingChannel: (client) => { 
        //CHECK IF THERE IS AN QUEING CHANNEL    
        client.guilds.map((guild) => {
            if(!guild.channels.find(x => x.name === config.queuechannel.toString().toLowerCase())){  
                guild.createChannel(config.queuechannel, { type: 'text' }) 
                .then(console.log("Created a channel for the queue"))
                .catch(console.error);
            }
        }); 
    }
};