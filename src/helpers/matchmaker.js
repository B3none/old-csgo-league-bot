const config = require('../../app/config.json');
const queue = require('./queue.js');
const channels = require('./channels');
const voiceChannels = require('../../app/data/voice_channels.json');
const axiosHelper = require('./axios');
const axios = axiosHelper.get();

const reloadQueue = client => {
  //Loop through all players that are in the voice channel.
  queue.reset();

  if (voiceChannels.queueChannelId) {
    let queueChannel = client.channels.find(channel => channel.id === voiceChannels.queueChannelId);
    if (!queueChannel) {
      return;
    }

    let queueMembers = queueChannel.members.filter(member => member.voiceChannelID == voiceChannels.queueChannelId);

    if (queueMembers) {
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
              name: member.user.username,
              steam,
              elo
            });

            //CHECK IF THERE ARE 10 peoples inside a voice channel
            queue.get()
              .then(players => {
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
};

module.exports = {
  setupQueueingChannels: client => {
    //SETUP TEXT CHANNEL & voice channel
    channels.checkChannels(client);

    //RESET QUEUE
    queue.reset();

    reloadQueue(client);
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
    } else if (newUserChannel && newUserChannel.id !== voiceChannels.queueChannelId) {
      queue.remove(oldMember.id);
    } else if (newUserChannel === undefined) {
      queue.remove(oldMember.id);
    }
  },
  reloadQueue,
};