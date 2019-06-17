const fs = require('fs');
const error = require('./error');
const config = require('../../app/config.json');
const afkChannel = require('../../app/data/afk_channel.json');
const teamChannels = require('../../app/data/team_channels');

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

      if (config.afk_channel !== '') {
        let afkVoiceChannel = categoryChildren.find(x => x.name === config.afk_channel.toString());

        if (!afkVoiceChannel) {
          afkVoiceChannel = await guild.createChannel(config.afk_channel, {
            type: 'voice',
            parent: category
          });
        }

        fs.writeFile(`${process.cwd()}/app/data/afk_channel.json`, JSON.stringify({afkChannelID: afkVoiceChannel.id}), error);
      }

      let team1 = categoryChildren.find(x => x.name === 'Team 1');
      if (!team1) {
        team1 = await guild.createChannel('Team 1', {
          type: 'voice',
          parent: category,
          userLimit: Math.ceil(config.players_per_match / 2)
        });
      }

      let team2 = categoryChildren.find(x => x.name === 'Team 2');
      if (!team2) {
        team2 = await guild.createChannel('Team 2', {
          type: 'voice',
          parent: category,
          userLimit: Math.ceil(config.players_per_match / 2)
        });
      }

      fs.writeFile(`${process.cwd()}/app/data/team_channels.json`, JSON.stringify({team1: team1.id, team2: team2.id}), error);
    });

    console.log('All channels have been setup.');
  },
  switchToTeamChannels: (client, team1, team2) => {
    //GET THE CHANNELS.
    if (teamChannels.team1) {
      let team1channel = teamChannels.team1;
      team1.map(player => {
        client.fetchUser(player.id).then(res => {
          res.lastMessage.member.setVoiceChannel(client.channels.get(team1channel));
        });
        //client.fetchUser(player.id).lastMessage.member.setVoiceChannel("Team 1");
      });
    }

    if (teamChannels.team2) {
      let team2channel = teamChannels.team2;
      team2.map(player => {
        client.fetchUser(player.id).then(res => {
          res.lastMessage.member.setVoiceChannel(client.channels.get(team2channel));
        });
      });
    }

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
              null
              /*client.channels.get(afkChannel.afkChannelID)*/
            ).then(() => resolve());
          })
          .catch(console.error);
      });
    })
};