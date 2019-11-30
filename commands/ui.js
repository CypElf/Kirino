const Discord = require('discord.js');

module.exports = {
	name: 'ui',
    description: 'Affiche des informations sur l\'utilisateur mentionné ou exactement nommé, ou sur l\'utilisateur utilisant la commande, par défaut.',
    guildOnly: true,
    args: false,
    usage: '{utilisateur}',
    category: "others",
    
    async execute(bot, msg, argsArray) {
        let member;

        // si aucun argument n'est fourni, l'utilisateur dont les informations seront affichées sera celui ayant exécuté la commande
        if (!argsArray.length) {
            member = msg.member;
        }

        // sinon, on regardera les arguments, et...
        else {
            // ... si un utilisateur est mentionné, ce sera lui dont les informations seront affichées...
            member = msg.mentions.members.first();
            if(!member) { // ... sinon, on cherchera un utilisateur dont le pseudo correspond à l'argument saisi pour afficher ses informations...
                let user = "";
                argsArray.forEach(element => {
                    user += element + " ";
                });
                user = user.substring(0, user.length - 1);
                member = msg.guild.members.array().find((currentUser) => {
                    return currentUser.user.username.toLowerCase() === user.toLowerCase();
                });
                if (member === undefined) { // ... et enfin si on a toujours rien, on répond qu'il n'y a pas d'utilisateur correspondant
                    return msg.channel.send("Veuillez mentionner ou écrire le nom exact d'un utilisateur du serveur. <:warning:568037672770338816>");
                }
            }
        }
        
        const creationDate = member.user.createdAt;

        // mois de création du compte
        const creationMonth = creationDate.getMonth() + 1;
        let creationMonthZ = "";
        if (creationMonth < 10) {
            creationMonthZ += "0";
        }
        creationMonthZ += creationMonth;

        // jour de création du compte
        const creationDay = creationDate.getDate();
        let creationDayZ = "";
        if (creationDay < 10) {
            creationDayZ += "0";
        }
        creationDayZ += creationDay;

        // heure de création du compte
        const creationHour = creationDate.getHours();
        let creationHourZ = "";
        if (creationHour < 10) {
            creationHourZ += "0";
        }
        creationHourZ += creationHour;

        // minute de création du compte
        const creationMin = creationDate.getMinutes();
        let creationMinZ = "";
        if (creationMin < 10) {
            creationMinZ += "0";
        }
        creationMinZ += creationMin;

        // seconde de création du compte
        const creationSec = creationDate.getSeconds();
        let creationSecZ = "";
        if (creationSec < 10) {
            creationSecZ += "0";
        }
        creationSecZ += creationSec;

        // -------------------------------------- //

        const joinedAt = member.joinedAt;

        // mois d'arrivée
        const joinedMonth = joinedAt.getMonth() + 1;
        let joinedMonthZ = "";
        if (joinedMonth < 10) {
            joinedMonthZ += "0";
        }
        joinedMonthZ += joinedMonth;

        // jour d'arrivée
        const joinedDay = joinedAt.getDate();
        let joinedDayZ = "";
        if (joinedDay < 10) {
            joinedDayZ += "0";
        }
        joinedDayZ += joinedDay;

        // heure d'arrivée
        const joinedHour = joinedAt.getHours();
        let joinedHourZ = "";
        if (joinedHour < 10) {
            joinedHourZ += "0";
        }
        joinedHourZ += joinedHour;

        // minute d'arrivée
        const joinedMin = joinedAt.getMinutes();
        let joinedMinZ = "";
        if (joinedMin < 10) {
            joinedMinZ += "0";
        }
        joinedMinZ += joinedMin;

        // seconde d'arrivée
        const joinedSec = joinedAt.getSeconds();
        let joinedSecZ = "";
        if (joinedSec < 10) {
            joinedSecZ += "0";
        }
        joinedSecZ += joinedSec;

        // Le Z à la fin des noms de variables correspond à la version chaine de caractère qui a un zéro devant si le nombre est < 10
        // ------------------------------------------------------------------------------------------------------------------------ //

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
        .addField("Date d'arrivée sur le serveur", "**" + joinedDayZ + "/" + joinedMonthZ + "/" + joinedAt.getFullYear() + "** à **" + joinedHourZ + ":" + joinedMinZ + ":" + joinedSecZ + "** UTC", true)
        .addField("Date de création du compte", "**" + creationDayZ + "/" + creationMonthZ + "/" + creationDate.getFullYear() + "** à **" + creationHourZ + ":" + creationMinZ + ":" + creationSecZ + "** UTC", true)
        .addField("Rôles", roles, true)
        .addField("Permissions", permsStr)
        .setThumbnail(member.user.avatarURL)
        .setFooter("Requête de " + msg.author.username, msg.author.avatarURL);
        msg.channel.send(informations);
    }
};