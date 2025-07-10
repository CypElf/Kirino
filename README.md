# [Kirino](https://discord.com/oauth2/authorize?client_id=493470054415859713&permissions=8&scope=bot%20applications.commands)

[![Kirino](https://cdn.discordapp.com/avatars/493470054415859713/9fd38f1029ac9c72cf004fcf5cd4a324.webp?size=128)](https://discord.com/oauth2/authorize?client_id=493470054415859713&scope=bot&permissions=8)

[![License](https://img.shields.io/badge/license-GPL_v3-blue)](./LICENSE)
[![CI status](https://github.com/CypElf/Kirino/actions/workflows/deploy.yml/badge.svg)](https://github.com/CypElf/Kirino/actions)
[![Discord](https://img.shields.io/discord/698105563162083379.svg?label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2)](https://discord.gg/7AnsDRE8hG)

## Description

Kirino is a multi-purpose, programming oriented Discord bot written in TypeScript with discord.js, featuring commands for programming languages execution, data format manipulations, utility and administration tools, and a nice XP system, available in English and French.

## How to host

First, clone this repository and place it wherever you want.

```
$ git clone https://github.com/CypElf/Kirino.git
```

Create a copy of the file `.env.template` and rename it `.env`. Open it, and fill it with the values you will be using.

The following environment variables are mandatory:

- `KIRINO_TOKEN` : This should be set to your bot token. Without it, the bot will not be able to start and connect to Discord.
- `CLIENT_ID` : This should be set to your bot application ID. It is required to register the slash commands.
- `DEBUG_SERVER_ID` : You can put here any server ID you want. Your bot should be a member of this server, and this is where the commands will be available if you register them for debug.

The following environment variables are optional, but needed for some features of the bot to work:

- `API_TOKEN` : You can place whatever value here, but it should remain secret. This value is used to authenticate incoming requests to the XP API, and should be placed in the `Authorization` header. If missing, the XP API feature is disabled and not started.
- `INVITE_LINK` : You can set this to the link used to invite your bot to a server. If missing, the `invite` command return a message saying that the invitation link is not available.
- `OWNER_ID` : Set it to your own account user ID. It is only used for the `donation` command, to fetch your profile picture and display it in the corner of the embed. If missing, your profile picture will not be added to the embed when using this command.

That being done, you need to install the bot dependencies using [bun](https://bun.sh/).

```
$ bun install
```

Before starting the bot, you need to register all the slash commands for the users to see them in their Discord clients. You can use the `registerProd` script for that.

Note that this should be used only to register production ready commands, because all users will be able to see them and the registered commands are not propagated instantaneously to all clients.

```
$ bun registerProd
```

If you want to register your commands only on one specific server for debug purposes, or if you have to register your commands multiple times in a small amount of time while working on them, you need to register your commands with the `registerDebug` script.

```
$ bun registerDebug
```

The only thing left to do is to start the bot with the `start` script.

```
$ bun start
```

Once you see the message `Connection to Discord established` in the output, the bot is online and ready to be used.

## Getting help

If you have questions or need help with something, you can [join the support server](https://discord.gg/7AnsDRE8hG) and ask in the `#help-support` channel. \
Also, if you want to stay informed about the project and the changes applied to Kirino over time, you might want to keep an eye on the `#news` and `#kirino-changelog` channels, or subscribe another channel elsewhere to them.

## Support the project

If you want to support me, the best way is to [add Kirino](https://discord.com/oauth2/authorize?client_id=493470054415859713&permissions=8&scope=bot%20applications.commands) to your servers, and leave a star on this repository. It would be highly appreciated.

## Credits

Copyright (C) 2018 - 2025 Elf \
This project is distributed with a [GPLv3](LICENSE) license.