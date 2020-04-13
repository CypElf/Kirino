const Discord = require('discord.js');

module.exports = {
	name: 'userinfo',
    description: 'Affiche des informations sur l\'utilisateur mentionné ou exactement nommé, ou sur l\'utilisateur utilisant la commande, par défaut.',
    guildOnly: true,
    args: false,
    usage: '{utilisateur}',
    aliases: ["ui"],
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
        
        let creationDate = member.user.createdAt;
        const creationMonth = String(creationDate.getMonth() + 1).padStart(2, "0");
        const creationDay = String(creationDate.getDate()).padStart(2, "0");
        const creationYear = creationDate.getFullYear();
        const creationHour = String(creationDate.getHours()).padStart(2, "0");
        const creationMinutes = String(creationDate.getMinutes()).padStart(2, "0");
        const cretionsSeconds = String(creationDate.getSeconds()).padStart(2, "0");
        creationDate = `${creationDay}/${creationMonth}/${creationYear} à ${creationHour}:${creationMinutes}:${cretionsSeconds}`;


        let joinedAt = member.joinedAt;
        const joinedAtMonth = String(joinedAt.getMonth() + 1).padStart(2, "0");
        const joinedAtDay = String(joinedAt.getDate()).padStart(2, "0");
        const joinedAtYear = joinedAt.getFullYear();
        const joinedAtHour = String(joinedAt.getHours()).padStart(2, "0");
        const joinedAtMinutes = String(joinedAt.getMinutes()).padStart(2, "0");
        const joinedAtSeconds = String(joinedAt.getSeconds()).padStart(2, "0");
        joinedAt = `${joinedAtDay}/${joinedAtMonth}/${joinedAtYear} à ${joinedAtHour}:${joinedAtMinutes}:${joinedAtSeconds}`;

        let perms = "";

        for (let flag in Discord.Permissions.FLAGS) {
            if (member.hasPermission(flag)) {
                perms += "`" + flag.toLowerCase().replace(/_/g, " ") + "`, ";
            }
        }
        perms = perms.substring(0, perms.length - 2);
        
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
        let premiumSince = member.premiumSince;
        if (premiumSince) {
            const premiumSinceMonth = String(premiumSince.getMonth() + 1).padStart(2, "0");
            const premiumSinceDay = String(premiumSince.getDate()).padStart(2, "0");
            const premiumSinceYear = premiumSince.getFullYear();
            const premiumSinceHour = String(premiumSince.getHours()).padStart(2, "0");
            const premiumSinceMinutes = String(premiumSince.getMinutes()).padStart(2, "0");
            const premiumSinceSeconds = String(premiumSince.getSeconds()).padStart(2, "0");
            premiumSince = `Oui, depuis le ${premiumSinceDay}/${premiumSinceMonth}/${premiumSinceYear} à ${premiumSinceHour}:${premiumSinceMinutes}:${premiumSinceSeconds}`;
        }
        else {
            premiumSince = "Non";
        }

        let informations = new Discord.MessageEmbed()
        .setAuthor(member.user.tag, member.user.avatarURL)
        .setColor('#000000')
        .addField("ID", member.user.id, true)
        .addField("Jeu", presence, true)
        .addField("Nickname", nickname, true)
        .addField("Date d'arrivée sur le serveur", joinedAt, true)
        .addField("Date de création du compte", creationDate, true)
        .addField("Booster", premiumSince)
        .addField("Rôles", roles, true)
        .addField("Permissions", perms)
        .setThumbnail(member.user.avatarURL)
        .setFooter("Requête de " + msg.author.username, msg.author.avatarURL);
        msg.channel.send(informations);
    }
};