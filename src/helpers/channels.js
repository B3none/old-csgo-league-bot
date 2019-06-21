const fs = require('fs');
const error = require('./error');
const config = require('../../app/config.json');

module.exports = {
  checkChannels: client => {
    console.log('Checking if all required channels exist.');

    client.guilds.map(async guild => {
      let category = guild.channels.find(x => x.type === 'category' && x.name === config.category);
      if (!category) {
        category = await guild.createChannel(config.category, {
          type: 'category'
        });
      }

      const categoryChildren = category.children;

      if (config.queue_text_channel !== '') {
        let queuingTextChannel = categoryChildren.find(x => x.name === config.queue_text_channel.toString().toLowerCase() && x.type === 'text');

        if (!queuingTextChannel) {
          queuingTextChannel = await guild.createChannel(config.queue_text_channel, {
            type: 'text',
            parent: category
          });
        }

        fs.writeFile(`${process.cwd()}/app/data/text_channels.json`, JSON.stringify({queueChannelId: queuingTextChannel.id}), error);
      }

      if (config.queue_voice_channel !== '') {
        let queuingVoiceChannel = categoryChildren.find(x => x.name === config.queue_voice_channel.toString().toLowerCase() && x.type === 'voice');

        if (!queuingVoiceChannel) {
          queuingVoiceChannel = await guild.createChannel(config.queue_voice_channel, {
            type: 'voice',
            parent: category,
            userLimit: config.players_per_match
          });
        }

        fs.writeFile(`${process.cwd()}/app/data/voice_channels.json`, JSON.stringify({queueChannelId: queuingVoiceChannel.id}), error);
      }

      if (guild.afkChannel !== '') {
        let afkVoiceChannel = guild.afkChannel

        if (!guild.afkChannel) {
          afkVoiceChannel = await guild.createChannel(config.afk_channel, {
            type: 'voice',
            parent: category
          });
        }
      }
    });

    console.log('All channels have been setup.');
  },
  switchToTeamChannels: async (client, matchId, team1, team2) => {
    const match = require('./match');
    const matchData = await match.get(matchId);

    // GET THE CHANNELS.
    team1.map(player => {
      client.fetchUser(player.id).then(res => {
        res.lastMessage.member.setVoiceChannel(client.channels.get(matchData.team1Channel));
      });
    });

    team2.map(player => {
      client.fetchUser(player.id).then(res => {
        res.lastMessage.member.setVoiceChannel(client.channels.get(matchData.team2Channel));
      });
    });

    const game = require('./game');
    game.finalizeGameData(client, {
      team1: team1,
      team2: team2
    });
  }, 
  toAfkChannel: (client, playerId) =>
    new Promise(resolve => {
      console.log(playerId);
      client.guilds.map(guild => {
        guild.fetchMember(playerId)
          .then((member) => {
            member.setVoiceChannel(
              client.channels.get(guild.afkChannelID)
            ).then(() => resolve());
          })
          .catch(console.error);
      });
    })
};