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
          guild.createChannel(config.queue_text_channel, {
            type: 'text',
            parent: category
          })
            .then(newChannel => {
              fs.writeFile(`${process.cwd()}/app/data/text_channels.json`, JSON.stringify({queueChannelId: newChannel.id}), error);
            })
            .catch(error);
        } else {
          fs.writeFile(`${process.cwd()}/app/data/text_channels.json`, JSON.stringify({queueChannelId: queuingTextChannel.id}), error);
        }
      }

      if (config.queue_voice_channel !== '') {
        let queuingVoiceChannel = guild.channels.find(x => x.name === config.queue_voice_channel.toString().toLowerCase() && x.type === 'voice');
        if (!queuingVoiceChannel) {
          guild.createChannel(config.queue_voice_channel, {
            type: 'voice',
            parent: category
          })
            .then(channel => {
              fs.writeFile(`${process.cwd()}/app/data/voice_channels.json`, JSON.stringify({queueChannelId: channel.id}), error);
            })
            .catch(console.error); 
        } else {
          fs.writeFile(`${process.cwd()}/app/data/voice_channels.json`, JSON.stringify({queueChannelId: queuingVoiceChannel.id}), error);
        }
      }

      if (config.afk_channel !== '') {
        let afkVoiceChannel = guild.channels.find(x => x.name === config.afk_channel.toString());
        if (!afkVoiceChannel) {
          guild.createChannel(config.afk_channel, {
            type: 'voice',
            parent: category
          })
            .then(() => {
              let channelId = client.channels.find(x => x.name === config.afk_channel.toString());
              fs.writeFile(`${process.cwd()}/app/data/afk_channel.json`, JSON.stringify({afkChannelID: channelId.id}), error);
            })
            .catch(console.error);
        }
      }

      let team1 = guild.channels.find(x => x.name === 'Team 1');
      let team2 = guild.channels.find(x => x.name === 'Team 2');
      if (!team1 && !team2) { 
        console.log('Creating and setting up channels for each team.');

        guild.createChannel('Team 1', {
          type: 'voice',
          parent: category
        })
          .then(() => {
            team1 = client.channels.find(x => x.name === 'Team 1');
            guild.createChannel('Team 2', {
              type: 'voice',
              parent: category
            })
              .then(() => {
                team2 = client.channels.find(x => x.name === 'Team 2');

                fs.writeFile(`${process.cwd()}/app/data/team_channels.json`, JSON.stringify({team1: team1.id, team2: team2.id}), error);
              })
          })
          .catch(console.error);
      } else if (team1 && team2) {
        fs.writeFile(`${process.cwd()}/app/data/team_channels.json`, JSON.stringify({team1: team1.id, team2: team2.id}), error);
      }
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
  toAfkChannel: (client, playerId) => {
    console.log(playerId);
    client.guilds.map(guild => {
      guild.fetchMember(playerId)
      .then((member) => {
        member.setVoiceChannel(client.channels.get(afkChannel.afkChannelID))
      })
      .catch(console.error);
    });
  }
};