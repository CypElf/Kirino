const Discord = require('discord.js');
const config = require('./config.json');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const bot = new Discord.Client();
bot.commands = new Discord.Collection();

bot.config = config;

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
	bot.commands.set(command.name, command);
}

bot.once('ready', () => {
    updateActivity();
    console.log("Connexion à discord établie.");
});

// -------------------------------------------------------------

bot.on('message', async msg => {

    // maintenance
    // if (msg.content.startsWith(bot.config.prefix)) return msg.channel.send("Maintenance en cours, veuillez patienter quelques instants, désolée pour la gêne occasionée !");
    // else return;

    if (msg.author.bot) return;
    if (msg.channel.type === "text") {
        if (!msg.guild.me.hasPermission("SEND_MESSAGES")) return;
        if (msg.content.startsWith(bot.config.prefix) && !msg.guild.me.hasPermission("MANAGE_MESSAGES")) return msg.channel.send("J'ai besoin de la permission gérer les messages pour pouvoir être utilisée.");
    }

    const messageArray = msg.content.split(" ");
    const commandName = messageArray[0].toLowerCase().slice(bot.config.prefix.length);
    const args = messageArray.slice(bot.config.prefix.length);    

    let db = new sqlite3.Database("./database.db", err => {
        if (err) return console.log("Impossible d'accéder à la base de données : " + err.message);
    });

    // ------------------------------------------------------------- vérification de l'AFK

    const mentions = msg.mentions.users;

    mentions.forEach(mention => {
        db.serialize(() => {
            db.get("SELECT * FROM afk WHERE id=(?)", [mention.id], (err, row) => {
                if (err) return console.log("Impossible d'accéder aux profils AFK dans la base de données : " + err.message);
                if (!(row === undefined)) {
                    if (row.id != msg.author.id) {
                        console.log(row.id + " "+ msg.author.id);
                        if (row.reason) {
                            msg.channel.send(`**${mention.username}** est actuellement AFK pour la raison suivante : ${row.reason}`);
                        }
                        else {
                            msg.channel.send(`**${mention.username}** est actuellement AFK, et n'a pas laissé de raison pour cela.`);
                        }
                    }
                }
            });
        }); 
    });

    db.serialize(() => {
        db.get("SELECT * FROM afk WHERE id=(?)", [msg.author.id], (err, row) => {
            if (err) return console.log("Impossible d'accéder aux profils AFK dans la base de données : " + err.message);
            if (!(row === undefined)) {
                db.run("DELETE FROM afk WHERE id=(?)", [msg.author.id], err => {
                    if (err) return console.log("Une erreur est survenue durant la suppression de votre profil AFK : " + err.message);
                });

                return msg.reply(`tu as été retiré de la liste des personnes AFK.`).then(msg => msg.delete(5000));
            }
        });
    });

    // ------------------------------------------------------------- vérification si un des mots est dans les mots bloqués du serveur

    if (msg.channel.type == "text") {
        if (!msg.content.startsWith(bot.config.prefix + "banword remove") && !msg.content.startsWith(bot.config.prefix + "banword add")) {
        
            let bannedWords = [];
        
            db.serialize(() => {
                db.get("SELECT * FROM banwords WHERE id=(?)", [msg.guild.id], (err, row) => {
                    if (err) return console.log("Impossible d'accéder aux mots bannis dans la base de données : " + err.message);
                    if (!(row === undefined || row.words === undefined)) {
                        let emojiNames = msg.content.match(/<:(.*?):[0-9]*>/gm);
                        if (emojiNames) emojiNames = emojiNames.map(emoji => emoji.split(":")[1].split(":")[0]);
                        bannedWords = row.words.split(",");
                        const loweredMessageArray = messageArray.map(word => word.toLowerCase());
                        bannedWords.forEach(word => {
                            if (loweredMessageArray.includes(word.toLowerCase())) return msg.delete();
                            if (emojiNames) {
                                if (word.startsWith(":") && word.endsWith(":")) {
                                    word = word.substring(1, word.length - 1);
                                    if (emojiNames.includes(word)) return msg.delete();
                                }
                            }
                        });
                    }
                });
            });
        }
    }

    // -------------------------------------------------------------------------------

    if (!msg.content.startsWith(bot.config.prefix)) return;

    // ------------------------------------------------------------- vérification de la commande spéciale guilds

    if (commandName == "guilds" && config.ownerID == msg.author.id) {
        let embedHeader = new Discord.MessageEmbed()
            .setDescription("**Invitations :**")
            .setColor("#DFC900");
        msg.channel.send(embedHeader);
        bot.guilds.array().forEach((guild, i) => {
            guild.fetchInvites().then(guildInvites => {
                let embedInvitations = new Discord.MessageEmbed();

                let invitesArray = guildInvites.array().map(guildInvite => {
                    return "https://discord.gg/"  + guildInvite.code;
                 });

                let invites;

                if(invitesArray.length === 0) invites = "aucune invitation disponible sur ce serveur";
                else {
                    invites = "`" + invitesArray.join(" / ") + "`";
                }

                embedInvitations.setDescription(`- ${guild.name} : ${invites}`)
                    .setColor("#DFC900");

                if (i === bot.guilds.array().length - 1) {
                    embedInvitations.setFooter("Requête de " + msg.author.username, msg.author.avatarURL);
                }

                msg.channel.send(embedInvitations);
            }).catch (err => {
                let embedError = new Discord.MessageEmbed();
                embedError.setDescription(`- ${guild.name} : permissions manquantes pour accéder aux invitations de ce serveur`)
                    .setColor("#DFC900");


                if (i === bot.guilds.length - 1) {
                    embedInvitations.setFooter("Requête de " + msg.author.username, msg.author.avatarURL);
                }
                msg.channel.send(embedError);
            });
        });
    }

    // ------------------------------------------------------------- vérification de la validité de la commande et exécution

    const command = bot.commands.get(commandName) || bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    if (!command) return;

    if (command.guildOnly && msg.channel.type !== 'text') {
        return msg.reply("Cette commande n'est pas faite pour être utilisée en messages privés. <:kirinopout:698923065773522944>");
    }

    if (command.args && !args.length) {
        return bot.commands.get("help").execute(bot, msg, [].concat(commandName));
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
    bot.user.setActivity(`ses ${guildsCount} serveurs | ${config.prefix}help`, { type: "LISTENING" /*PLAYING, STREAMING, LISTENING ou WATCHING*/ });
}

bot.login(bot.config.token).catch(err => console.log(err.message));