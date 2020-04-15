module.exports = {
	name: "report",
    description: "Permet de signaler un problème, un bug, ou proposer de nouvelles commandes et autres améliorations.\nN'utilisez pas abusivement cette commande pour envoyer des choses ne rentrant pas dans ce cadre.",
    guildOnly: false,
	args: true,
	category: "others",
	usage: "[message]",
	
	async execute(bot, msg, args) {
        let origin;
        let originAvatar;
        if (msg.channel.type === "text") {
            if (!msg.guild.me.hasPermission("ADD_REACTIONS")) {
                return msg.channel.send("Vous ne pouvez pas utiliser cette commande si je n'ai pas la permission de mettre des réactions. <:kirinopout:698923065773522944>");
            }
            origin = msg.guild.name;
            originAvatar = msg.guild.iconURL();
        }
        else {
            origin = "DM";
            originAvatar = msg.author.displayAvatarURL();
        }
        const report = args.join(" ");
        let confirmationMsg = await msg.channel.send("Confirmez vous vouloir envoyer ce report ?\n```" + report + "``` Vous avez 30 secondes pour confirmer, ou ce report sera automatiquement annulé.");

        confirmationMsg.react('✅');
        confirmationMsg.react('❌');

        const filter = (reaction, user) => {
            return reaction.emoji.name === '✅' && user.id === msg.author.id || reaction.emoji.name === '❌' && user.id === msg.author.id;
        }
        const collector = confirmationMsg.createReactionCollector(filter, { max: 1, time: 30_000 });

        collector.on("collect", (reaction, reactionCollector) => {
            if (reaction.emoji.name === '✅') {
                const kirinoDebug = bot.guilds.cache.find(guild => {
                    return guild.id === bot.config.kirinoDebugID;
                });
                if (kirinoDebug) {
                    const reportChannel = kirinoDebug.channels.cache.find(channel => {
                        return channel.id === bot.config.reportChannelID;
                    });
                    if (reportChannel) {
                        const Discord = require("discord.js");
    
                        let reportEmbed = new Discord.MessageEmbed()
                            .setTitle("**Nouveau report !**")
                            .setThumbnail(originAvatar)
                            .setDescription("**Origine du report :** " + origin + "\n**Message :** " + report)
                            .setColor("#CC0101")
                            .setFooter("Report de " + msg.author.tag, msg.author.displayAvatarURL());
                        reportChannel.send(reportEmbed);
                    }
                    else {
                        return msg.channel.send("Le salon du serveur sur lequel je suis censée envoyer votre report est introuvable... <:kirinowhat:698923096752783401> Veuillez contacter mon développeur au plus vite (CypElf#4541) afin vite corriger ce problème !");
                    }
                }
                else {
                    return msg.channel.send("Le serveur sur lequel je suis censée envoyer votre report est introuvable... <:kirinowhat:698923096752783401> Veuillez contacter mon développeur au plus vite (CypElf#4541) afin vite corriger ce problème !");
                }
                msg.channel.send("Le report a bien été envoyé. Merci de contribuer à m'améliorer <:kirinoglad:698923046819594351> !");
            }
            else {
                msg.channel.send("Le report a bien été annulé.");
            }
        });
	}
};