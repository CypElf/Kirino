// wip

const Discord = require('discord.js');

module.exports = {
	name: 'ri',
    description: 'Affiche des informations sur le rôle mentionné ou exactement nommé.',
    guildOnly: true,
    args: true,
    usage: '[rôle]',
    category: "others",
	execute(bot, msg, argsArray) {
        let member = msg.mentions.members.first();

        if(!member) {
            let user = "";
            argsArray.forEach(element => {
                user += element + " ";
            });
            user = user.substring(0, user.length - 1);
            member = msg.guild.members.array().find((currentUser) => {
                return currentUser.user.username.toLowerCase().replace(/_/g, " ") === user.toLowerCase();
            });
            if (member === undefined) {
                return msg.channel.send("Veuillez mentionner ou écrire le nom exact d'un utilisateur du serveur. <:warning:568037672770338816>");
            }
        }

        const creationDate = member.user.createdAt;
        const joinedAt = member.joinedAt;
        const permsArray = member.permissions.toArray();
        let permsStr = "";
        permsArray.forEach(perm => {
            permsStr += "`" + perm.toLowerCase().replace(/_/g, " ") + "`, ";
        });
        permsStr = permsStr.substring(0, permsStr.length - 2);
        const arrayRoles = member.roles;
        let roles = "";
        arrayRoles.forEach((role) => {
            roles += role + " ";
        });
        let nickname = member.nickname;
        if (nickname === null) {
            nickname = "Aucun"
        }
        let presence;
        try {
            presence = member.presence.game.name;
        }
        catch(err) {
            presence = "Aucun";
        }

        let informations = new Discord.RichEmbed()
        .setAuthor(member.user.tag, member.user.avatarURL)
        .setColor('#000000')
        .addField("ID", member.user.id, true)
        .addField("Jeu", presence, true)
        .addField("Nickname", nickname, true)
        .addField("Date d'arrivée sur le serveur", "**" + joinedAt.getDate() + "/" + (joinedAt.getMonth() + 1) + "/" + joinedAt.getFullYear() + "** à **" + joinedAt.getHours() + ":" + joinedAt.getMinutes() + ":" + joinedAt.getSeconds() + "**", true)
        .addField("Date de création du compte", "**" + creationDate.getDate() + "/" + (creationDate.getMonth() + 1) + "/" + creationDate.getFullYear() + "** à **" + creationDate.getHours() + ":" + creationDate.getMinutes() + ":" + creationDate.getSeconds() + "**", true)
        .addField("Rôles", roles, true)
        .addField("Permissions", permsStr, true)
        .setThumbnail(member.user.avatarURL)
        .setFooter("Requête de " + msg.author.username, msg.author.avatarURL);
        msg.channel.send(informations);
    },

    help(bot, msg, helpEmbed) {
        helpEmbed
            .setDescription("Cette commande permet d'afficher des informations sur un rôle.")
            .addField("Procédure", "Cette commande s'utilise comme ceci : `" + config.prefix + this.name + " " + this.usage + "`.");
        msg.channel.send(helpEmbed);
    },
};