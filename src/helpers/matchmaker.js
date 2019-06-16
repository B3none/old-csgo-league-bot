let config = require('../../app/config.json');
let queue = require('./queue.js');
let channels = require('./channels');
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

    if (newUserChannel !== undefined && newMember.id !== client.user.id && newUserChannel.id === voiceChannels.queueChannelId) {
      //GET THE PLAYERS ELO FROM THE DATABASE.
      console.log('that other one');

      axios.get(`/player/discord/${newMember.id}`)
        .then((response) => {
          queue.add({id: newMember.id, confirmed: false, confirmable: false, name: newMember.user.tag, steam: response.data.steam, elo: response.data.elo});
          //CHECK IF THERE ARE 10 peoples inside a voice channel
          queue.get()
            .then(players => {
              console.log(players);
              if (players.length === config.players_per_match) {
                console.log('Reached enough players to start a game, sending confirmation requests.');
                const game = require('./game');

                game.initialize(players, client);
                game.sendAwaitConfirmation(client, players);
              }
            });
        })
        .catch(error => {
          console.log(error.response.data);
          console.log('died (matchmaker 1)');
        })
    } else if (newUserChannel) {
      if (newUserChannel.id !== voiceChannels.queueChannelId) {
        queue.remove(oldMember.id);
      }
    } else if (newUserChannel === undefined) {
      queue.remove(oldMember.id);
    }
  },
  reloadQueue: (client) => {
    //Loop through all players that are in the voice channel.
    queue.reset();

    if (voiceChannels.queueChannelId) {
      let queueChannel = client.channels.find(channel => channel.id === voiceChannels.queueChannelId);
      let queueMembers = queueChannel.members.filter(member => member.voiceChannelID == voiceChannels.queueChannelId);

      if (queueMembers) {
        console.log(queueMembers);

        queueMembers.map(member => {
          axios.get(`/player/discord/${member.id}`)
            .then(response => {
              const { steam, elo, discord_name } = response.data;

              if (discord_name !== member.user.username) {
                axios.post(`/discord/update/${member.id}`, {
                  discord_name: member.user.username
                });
              }

              queue.add({
                id: member.id,
                confirmed: false,
                confirmable: false,
                name: member.user.tag,
                steam,
                elo
              });

              //CHECK IF THERE ARE 10 peoples inside a voice channel
              queue.get()
                .then(players => {
                  console.log(players);
                  if (players.length === config.players_per_match) {
                    console.log('Reached enough players to start a game, sending confirmation requests.');
                    const game = require('./game');

                    game.initialize(players, client);
                    game.sendAwaitConfirmation(client, players);
                  }
                });
            })
            .catch(error => {
              console.log((error.response && error.response.data) || error);
              console.error('died (matchmaker 2)');
            })
        })
      }
    } else {
      console.log(`Voice queueing channel doesn't exist.`);
    }
  },
};