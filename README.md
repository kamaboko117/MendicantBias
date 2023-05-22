<h1 align="center">
  <img src="https://cdn.discordapp.com/avatars/688035147559337994/2ffc22bf8b43490894d39f1096719e44.png?size=1024" alt="Logo" width="256" height="256">

  
  Mendicant Bias
</h1>
A Discord Bot to create election tournaments on server emojis.

## Running this code
This bot uses mongoDB with the mongoose package. A .env file is required at the root of the repository. Use it to set the required variables:
Key | Value
:---: | :---:
`TOKEN=`| **\<your bot token>**
`DATABASE=` | (optional) **\<your mongoose connection String>** needed for conducting tournaments and matches
`YTCOOKIE=` | (optional) **\<a valid youtube cookie for a logged in account>** needed for any use of the `/play` command
`WEATHER=` | (optional) **\<an openweathermap api key>** needed for any use of the `/weather` command
`GEOCODE=` | (optional)  **\<a mapbox api key>** needed for any use of the `weather` command

Once your .env file is set up, use `node .` at the root of the repository to run the bot

## Using the bot
You can either use this code using your own token or add the original bot to your server through this [link](https://discord.com/api/oauth2/authorize?client_id=688035147559337994&permissions=137439215616&scope=bot).

if you need help with the commands, use the `/help` command directly. You can get more info with `/help <command name>` (example: `/help create-tourney`)

## How it works
if you're interested in the tournament logic implementation, check this **[wiki](https://github.com/kamaboko117/MendicantBias/wiki/Tournament-Logic)**
