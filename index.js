const   Discord = require ('discord.js');
const   bot = new Discord.Client();
const   token = 'Njg4MDM1MTQ3NTU5MzM3OTk0.XrSlJw.tPelgGrlPLNUqVKg09ve0OWr8yc';
var     PREFIX = 'PITIER ';

bot.on('ready', () =>{
    console.log('running full system diagnostics');
})

bot.on('message', message=>{
    let args = message.content.substring(PREFIX.length).split(" ");

    switch(args[0]){
        case 'gungaginga':
            message.channel.send('https://tenor.com/view/gunga-ginga-gunga-ginga-gangu-gongu-gif-14816269 GUNGA GINGA GUNGA GINGA GUNGA GINGA');
        break;
    }
})
bot.login(token);