let config = require('../../app/config.json');
let queue = require('./queue.js');
let channels = require('./channels');
let game = require('./game');
let fs = require('fs');
let voiceChannels = require('../../app/data/voice_channels.json');
const axiosHelper = require('./axios');
const axios = axiosHelper.get();

module.exports = {
  setupQueueingChannel: (client) => {
    //SETUP TEXT CHANNEL & voice channel
    channels.checkChannels(client);

    //RESET QUEUE
    queue.reset();
  },
  channelUpdate: (oldMember, newMember, client) => {
    let newUserChannel = newMember.voiceChannel;
    let oldUserChannel = oldMember.voiceChannel;

    if (newUserChannel !== undefined && newMember.id !== client.user.id && newUserChannel.id === voiceChannels.queueChannelId) {
      //GET THE PLAYERS ELO FROM THE DATABASE.
      axios.get(`/player/discord/${newMember.id}`)
        .then((response) => {
          queue.add({id: newMember.id, confirmed: false, confirmable: false, name: newMember.user.tag, steam: response.data.steam, elo: response.data.elo});
          //CHECK IF THERE ARE 10 peoples inside a voice channel
          queue.get()
            .then(players => {
              console.log(players);
              if (players.length === config.playerInAMatch) {
                console.log('Reached enough players to start a game, sending confirmation requests.');
                game.initialize(players);
                game.sendAwaitConfirmation(client, players);
              }
            });
        })
        .catch(error => {
          console.log('Something went wrong: ', error);
        })
    } else if (newUserChannel) {
      if (newUserChannel.id !== voiceChannels.queueChannelId) {
        queue.remove(oldMember.id);
      }
    } else if (newUserChannel === undefined) {
      queue.remove(oldMember.id);
    }
  },
};