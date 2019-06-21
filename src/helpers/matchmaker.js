// const config = require('../../app/config.json');
// const queue = require('./queue.js');
// const channels = require('./channels');
// const voiceChannels = require('../../app/data/voice_channels.json');
// const axiosHelper = require('./axios');
// const axios = axiosHelper.get();

// const reloadQueue = client => {

//   if (voiceChannels.queueChannelId) {
//     let queueChannel = client.channels.find(channel => channel.id === voiceChannels.queueChannelId);
//     if (!queueChannel) {
//       return;
//     }

//     let queueMembers = queueChannel.members.filter(member => member.voiceChannelID == voiceChannels.queueChannelId);

//     if (queueMembers) {
//       queueMembers.map(member => {
//         axios.get(`/player/discord/${member.id}`)
//           .then(response => {
//             const { steam, score, discord_name } = response.data;

//             if (discord_name !== member.user.username) {
//               axios.post(`/discord/update/${member.id}`, {
//                 discord_name: member.user.username
//               });
//             }

//             // const matchId = queue.add({
//             //   id: member.id,
//             //   confirmed: false,
//             //   confirmable: false,
//             //   name: member.user.username,
//             //   steam,
//             //   score
//             // });

//             if (matchId) {
//               // move to team channel
//               console.log('you are already in a game fam');
//               return;
//             }

//             //CHECK IF THERE ARE 10 peoples inside a voice channel
//             queue.get()
//               .then(players => {
//                 if (players.length === config.players_per_match) {
//                   console.log('Reached enough players to start a game, sending confirmation requests.');
//                   const game = require('./game');

//                   const matchId = game.initialize(client, players);
//                   game.sendAwaitConfirmation(client, matchId);
//                 }
//               });
//           })
//           .catch(error => {
//             console.log((error.response && error.response.data) || error);
//           })
//       })
//     }
//   } else {
//     console.log(`Voice queueing channel doesn't exist.`);
//   }
// };

// module.exports = {
//   setupQueueingChannels: client => {
//     //SETUP TEXT CHANNEL & voice channel
//     channels.checkChannels(client);

//     //RESET QUEUE
//     queue.reset();

//     reloadQueue(client);
//   },
//   channelUpdate: (oldMember, newMember, client) => {
//     let newUserChannel = newMember.voiceChannel;

//     if (newUserChannel !== undefined && newMember.id !== client.user.id && newUserChannel.id === voiceChannels.queueChannelId) {
//       //GET THE PLAYERS ELO FROM THE API.
//       axios.get(`/player/discord/${newMember.id}`)
//         .then(response => {
//           const matchId = queue.add({
//             id: newMember.id,
//             confirmed: false,
//             confirmable: false,
//             name: newMember.user.username,
//             steam: response.data.steam,
//             score: response.data.score
//           });

//           if (matchId) {
//             // move to team channel
//             console.log('you are already in a game fam');
//             return;
//           }

//           //CHECK IF THERE ARE 10 people inside a voice channel
//           queue.get()
//             .then(players => {
//               if (players.length === config.players_per_match) {
//                 console.log('Reached enough players to start a game, sending confirmation requests.');
//                 const game = require('./game');

//                 let matchId = game.initialize(client, players);
//                 game.sendAwaitConfirmation(client, matchId);
//               }
//             });
//         })
//         .catch(error => {
//           console.log((error.response && error.response.data) || error);
//         })
//     } else if (newUserChannel && newUserChannel.id !== voiceChannels.queueChannelId) {
//       queue.remove(oldMember.id);
//     } else if (newUserChannel === undefined) {
//       queue.remove(oldMember.id);
//     }
//   },
//   reloadQueue,
// };

const _ = require('lodash');
const config = require('../../app/config.json');
const PLAYERS_PER_MATCH = config.players_per_match;
let queueManager = require('./queueManager.js');

class matchMaker {
  
  constructor() {
    this.currentGameState = null;
    this.gameQueue = new queueManager();
    // Add later.
    this.currentClearCurrentGame = null;
  }

  getFormaterCollection(collection) {
    let displayGameCollection = [];
    collection.forEach(player => {
      displayGameCollection.push(player.discordUser + " " + player.score + "ELO");
    });

    return displayGameCollection;
  }

  // TODO: Write the Current Game Status based on Player Score from Rankme. Then I can handle the current game.
  handleCurrentGame(gameGroup) {
    return null;
  }

  join(discordUser) {
    let promise = new Promise((resolve, reject) => {
      let result = {
        addedPlayer: false,
        matchDetails: null,
      };

      var addPlayerData = {
        "discordTag": discordUser.tag,
        "discordUser": discordUser,
      };

      this.gameQueue.addPlayerToQueue(addPlayerData).then((result) =>{
        if (result.addedPlayer && this.gameQueue.getQueueSize() >= PLAYERS_PER_MATCH) {
          let gameGroup = this.gameQueue.getGameGroup();
          result.matchDetails = this.handleCurrentGame(gameGroup);
        }

        resolve(result);
        
      }).catch(reject)
    });

    return promise;
  }

  leave(discordAuthor) {
    return this.gameQueue.removePlayerFromQueue(discordAuthor);
  }

  status() {
    return {
      "currentStatus": this.displayFormatGame(this.currentGameStatus),
      "waitingQueue": this.getFormaterCollection(this.gameQueue.getWaitingQueue()),
    };
  }
}
module.exports = matchMaker;