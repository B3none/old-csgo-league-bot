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
      //GET THE PLAYERS ELO FROM THE API.
      axios.get(`/player/discord/${newMember.id}`)
        .then((response) => {
          queue.add({id: newMember.id, confirmed: false, confirmable: false, name: newMember.user.username, steam: response.data.steam, elo: response.data.elo});

          //CHECK IF THERE ARE 10 people inside a voice channel
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
      if(!queueChannel) return;
      let queueMembers = queueChannel.members.filter(member => member.voiceChannelID == voiceChannels.queueChannelId);

      if (queueMembers) {
        console.log(queueMembers);

        queueMembers.map(member => {
          axios.get(`/player/discord/${member.id}`)
            .then(response => {
              const { steam, elo, discord_name } = response.data;

              console.log('checking user names');
              console.log(`${discord_name} == ${member.user.username}`);
              if (discord_name !== member.user.username) {
                console.log('updating discord name of: ' + member.user.username);
                axios.post(`/discord/update/${member.id}`, {
                  discord_name: member.user.username
                });
              }

              queue.add({
                id: member.id,
                confirmed: false,
                confirmable: false,
                name: member.user.username,
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
            })
        })
      }
    } else {
      console.log(`Voice queueing channel doesn't exist.`);
    }
  },
};