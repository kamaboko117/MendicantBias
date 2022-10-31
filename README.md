# MendicantBias
A Discord Bot to create voting tournaments on server emojis.

## Running this code
nodejs is required. Currently using version 16.18.0, other versions might have incompatibilities.

This bot uses mongoDB with the mongoose package. A .env file is required at the root of the repository. Use it to set the required variables:
Key | Value
:---: | :---:
`TOKEN=`| \<your bot token>
`DATABASE=` | \<your mongoose connection String>

## Using the bot
You can either use this code using your own token or add the original bot to your server through this [link](https://discord.com/api/oauth2/authorize?client_id=688035147559337994&permissions=137439215616&scope=bot).

if you need help with the commands, use the `/help` command directly. You can get more info with `/help <command name>` (example: `/help create-tourney`)
