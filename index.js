require('dotenv').config(); //initialize dotenv
const { Client, Intents } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, NoSubscriberBehavior  } = require('@discordjs/voice');
const ytdl = require('ytdl-core-discord');
const { join } = require('path');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] }); //create new client

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async msg => {
    const msgArr = msg.content.split(" ");
    const player = createAudioPlayer();
    switch(msgArr[0]) {
        case '!ping':
            msg.reply('Pong!');
            break;
        case '!play': 
            console.log("Playing song");
            if(!validURL(msgArr[1])){
                msg.reply("Please provide an url to play!");
                break;
            }
            if(!msg.member.voice.channel){
                msg.reply("Please join a voice channel!");
                break;
            }
            const connection = joinVoiceChannel({
                channelId: msg.member.voice.channel.id,
                guildId:  msg.guild.id,
                adapterCreator: msg.member.voice.channel.guild.voiceAdapterCreator,
            });

            const songInfo = await ytdl.getInfo(msgArr[1]);
            const song = {
                title: songInfo.videoDetails.title,
                url: songInfo.videoDetails.video_url,
            };
            const stream = await ytdl(song.url, { filter: 'audioonly', dlChunkSize: 0});
            let resource = createAudioResource(stream);
            
            player.play(resource);

            const subscription = connection.subscribe(player);

            msg.reply('Now playing ' + song.title);
            break;
            
        case '!stop':
            
    }
  });

//make sure this line is the last line
client.login(process.env.CLIENT_TOKEN); //login bot using token


function validURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(str);
}
