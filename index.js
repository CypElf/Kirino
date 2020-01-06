const Discord = require('discord.js');
const config = require('./config.json');
const fs = require('fs');
// const express = require("./express.js");

const bot = new Discord.Client();
bot.commands = new Discord.Collection();

bot.config = config;

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
	bot.commands.set(command.name, command);
}

let guildsCount;

bot.once('ready', () => {
    updateActivity();
    console.log("Bot en ligne !");
});

bot.afk = new Map();

// ------------------------------------------------------------- évènement messages

bot.on('message', async msg => {

    if (msg.author.bot) return;

    const messageArray = msg.content.split(" ");
    let commandName = messageArray[0].toLowerCase();
    const args = messageArray.slice(bot.config.prefix.length);

    // ------------------------------------------------------------- vérification de l'AFK

    const mention = msg.mentions.users.first();
    if (mention) {
        let mentioned = bot.afk.get(mention.id);
        if (mentioned) {
            if (mentioned.reason) {
                msg.channel.send(`**${mentioned.usertag}** est actuellement AFK pour la raison suivante : ${mentioned.reason}`);
            }

            else {
                msg.channel.send(`**${mentioned.usertag}** est actuellement AFK, et n'a pas laissé de raison pour cela.`);
            }            
        }
    }
    let afkcheck = bot.afk.get(msg.author.id);
    if (afkcheck) {
        return [bot.afk.delete(msg.author.id), msg.reply(`tu as été retiré de la liste des personnes AFK.`).then(msg => msg.delete(5000))];
    }

    commandName = commandName.slice(bot.config.prefix.length);
    if (!msg.content.startsWith(bot.config.prefix)) return;

    // maintenance
    // return msg.channel.send("Maintenance en cours, veuillez patienter quelques instants, désolée pour la gêne occasionée !");

    // ------------------------------------------------------------- vérification de la commande spéciale invisible d'affichage des invitations de tous les serveurs sur lesquels est le bot

    if (commandName == "guilds" && config.ownerID == msg.author.id) {
        let invites = ["I am required else it won't work"], ct = 0;
        bot.guilds.forEach(guild => {
            guild.fetchInvites().then(guildInvites => {
                if (Array.isArray(guildInvites.array()) && guildInvites.array().length) {
                    invites[invites.length + 1] = (guild + " : `" + guildInvites.array().join(" / ") + "`");
                }

                else {
                    invites[invites.length + 1] = (guild + " : `aucune invitation disponible sur ce serveur`");
                }                
                ct++;
                if(ct >= bot.guilds.size) {
                    invites.forEach((invite, i) => {
                        if (invite == undefined) invites.splice(i, 1);
                    }); 

                    invites.shift();
                    invites.forEach((invite, i) => invites[i] = "- " + invite);
                    invites = invites.join("\n");

                    let embed = new Discord.RichEmbed()
                    .setTitle("Invitations :")
                    .setDescription(invites)
                    .setColor('#DFC900')
                    .setFooter("Requête de " + msg.author.username, msg.author.avatarURL);

                    msg.channel.send(embed);
                }

            }).catch (err => {
                ct++;
            });
        });
    }

    // ------------------------------------------------------------- vérification de la validité de la commande et exécution

    const command = bot.commands.get(commandName) || bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    if (!command) return;

    if (command.guildOnly && msg.channel.type !== 'text') {
        return msg.reply('Cette commande n\'est pas faite pour être utilisée en messages privés. <:warning:568037672770338816>');
    }

    if (command.args && !args.length) {
        let helpEmbed = new Discord.RichEmbed()
            .setColor('#DFC900')
            .setTitle("**Utilisation**")
            .setFooter("Requête de " + msg.author.username, msg.author.avatarURL);
            return command.help(bot, msg, helpEmbed);
    }

    try {
        command.execute(bot, msg, args);
    }
    catch (err) {
        console.error(err);
    }
});

// ------------------------------------------------------------- évènements ajout / retrait de serveurs

bot.on("guildCreate", () => updateActivity());
bot.on("guildDelete", () => updateActivity());

// ------------------------------------------------------------- fonction pour mettre à jour le rich presence en fonction du nombre de serveurs sur lequel le bot est

const updateActivity = () => {
    guildsCount = bot.guilds.size;
    bot.user.setActivity(`ses ${guildsCount} serveurs | ${config.prefix}help`, { type: "WATCHING" /*PLAYING, STREAMING, LISTENING ou WATCHING*/ });
}

bot.login(bot.config.token);