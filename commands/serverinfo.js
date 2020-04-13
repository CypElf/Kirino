module.exports = {
	name: 'serverinfo',
    description: 'Affiche des informations sur le serveur.',
    guildOnly: true,
    args: false,
    aliases: ["si"],
    category: "others",
    
    async execute(bot, msg) {
        const Discord = require('discord.js');
        const creationDate = msg.guild.createdAt;

        // mois
        const creationMonth = creationDate.getMonth() + 1;
        let creationMonthZ = "";
        if (creationMonth < 10) {
            creationMonthZ += "0";
        }
        creationMonthZ += creationMonth;

        // jour
        const creationDay = creationDate.getDate();
        let creationDayZ = "";
        if (creationDay < 10) {
            creationDayZ += "0";
        }
        creationDayZ += creationDay;

        // heure
        const creationHour = creationDate.getHours();
        let creationHourZ = "";
        if (creationHour < 10) {
            creationHourZ += "0";
        }
        creationHourZ += creationHour;

        // minutes
        const creationMin = creationDate.getMinutes();
        let creationMinZ = "";
        if (creationMin < 10) {
            creationMinZ += "0";
        }
        creationMinZ += creationMin;

        // secondes
        const creationSec = creationDate.getSeconds();
        let creationSecZ = "";
        if (creationSec < 10) {
            creationSecZ += "0";
        }
        creationSecZ += creationSec;
        
        // Le Z à la fin des noms de variables correspond à la version chaine de caractère qui a un zéro devant si le nombre est < 10
        // ------------------------------------------------------------------------------------------------------------------------ //

        const membres = msg.guild.members;
        const bots = membres.filter(membre => membre.user.bot).size;
        const humains = msg.guild.memberCount - bots;
        const arrayRoles = msg.guild.roles;
        let roles = "";
        let nbRoles = 0;
        arrayRoles.forEach((role) => {
            roles += role + " ";
            nbRoles++;
        });

        if (nbRoles === 1) {
            roles += " (" + nbRoles + " rôle)";
        }
        else {
            roles += " (" + nbRoles + " rôles)";
        }

        const salons = msg.guild.channels;
        const nbSalonsTxt = salons.filter(salon => salon.type == "text").size;
        const nbSalonsVocaux = salons.filter(salon => salon.type == "voice").size;
        let emojis = msg.guild.emojis.array();
        const emojisCount = emojis.length;
        emojis = emojis.join(", ");
        if (emojis.length === 0) emojis = "Aucun";
        if (emojisCount === 0 || emojisCount === 1) {
            emojis += " (" + emojisCount + " émoji)";
        }
        else {
            emojis += " (" + emojisCount + " émojis)";
        }

        let informations = new Discord.RichEmbed()
        .setAuthor(msg.guild.name, msg.guild.owner.user.avatarURL)
        .setColor('#000000')
        .addField("Propriétaire du serveur", msg.guild.owner.user.tag, true)
        .addField("ID du serveur", msg.guild.id, true)
        .addField("Membres", msg.guild.memberCount, true)
        .addField("Humains", humains, true)
        .addField("Bots", bots, true)
        .addField("Emojis", emojis)
        .addField("Rôles", roles)
        .addField("Salons", nbSalonsTxt + " textuels, " + nbSalonsVocaux + " vocaux", true)
        .addField("Date de création du serveur", creationDayZ + "/" + creationMonthZ + "/" + creationDate.getFullYear() + " à " + creationHourZ + ":" + creationMinZ + ":" + creationSecZ + " UTC", true)
        .setThumbnail(msg.guild.iconURL)
        .setFooter("Requête de " + msg.author.username, msg.author.avatarURL);
        msg.channel.send(informations);
    }
};