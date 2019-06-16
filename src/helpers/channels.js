const fs = require('fs');
const game = require('./game');
const error = require('./error');
const config = require('../../app/config.json');
const teamChannels = require('../../app/data/teamchannels');

module.exports = {
  checkChannels: client => {
    console.log('Checking if all required channels exist.');

    client.guilds.map(guild => {
      if (config.queuechanneltext !== '' && !guild.channels.find(x => x.name === config.queuechanneltext.toString().toLowerCase())) {
        guild.createChannel(config.queuechanneltext, {
          type: 'text'
        })
          .then(() => {
            let channelId = client.channels.find(x => x.name === config.queuechanneltext.toString().toLowerCase()).id;
            console.log(channelId);
            fs.writeFile(`${process.cwd()}/app/data/textchannels.json`, JSON.stringify({queueChannelId: channelId}), error);
          })
          .catch(console.error);
      }

      if (config.queuechannelvoice !== '') {
        let queuingVoiceChannel = guild.channels.find(x => x.name === config.queuechannelvoice.toString().toLowerCase());
        if (!queuingVoiceChannel) {
          guild.createChannel(config.queuechannelvoice, {
            type: 'voice'
          })
            .then(channel => {
              fs.writeFile(`${process.cwd()}/app/data/voicechannels.json`, JSON.stringify({queueChannelId: channel.id}), error);
            })
            .catch(console.error);
        } else {
          fs.writeFile(`${process.cwd()}/app/data/voicechannels.json`, JSON.stringify({queueChannelId: queuingVoiceChannel.id}), error);
        }
      }

      let team1 = guild.channels.find(x => x.name === 'Team 1');
      let team2 = guild.channels.find(x => x.name === 'Team 2');
      if (!team1 && !team2) {
        console.log('Creating and setting up channels for each team.');

        guild.createChannel('Team 1', {
          type: 'voice'
        })
          .then(() => {
            team1 = client.channels.find(x => x.name === 'Team 1');
            guild.createChannel('Team 2', {
              type: 'voice'
            })
              .then(() => {
                team2 = client.channels.find(x => x.name === 'Team 2');

                fs.writeFile(`${process.cwd()}/app/data/teamchannels.json`, JSON.stringify({team1: team1.id, team2: team2.id}), error);
              })
          })
          .catch(console.error);
      } else if (team1 && team2) {
        fs.writeFile(`${process.cwd()}/app/data/teamchannels.json`, JSON.stringify({team1: team1.id, team2: team2.id}), error);
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

    game.finalizeGameData(client, {
      teams: {
        team1: team1,
        team2: team2
      }
    });
  }
};