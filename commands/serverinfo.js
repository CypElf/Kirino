module.exports = {
	name: 'serverinfo',
    description: 'Affiche des informations sur le serveur.',
    guildOnly: true,
    args: false,
    aliases: ["si"],
    category: "others",
    
    async execute(bot, msg) {
        const Discord = require('discord.js');

        let creationDate = msg.guild.createdAt;
        const creationMonth = String(creationDate.getMonth() + 1).padStart(2, "0");
        const creationDay = String(creationDate.getDate()).padStart(2, "0");
        const creationYear = creationDate.getFullYear();
        const creationHour = String(creationDate.getHours()).padStart(2, "0");
        const creationMinutes = String(creationDate.getMinutes()).padStart(2, "0");
        const cretionsSeconds = String(creationDate.getSeconds()).padStart(2, "0");
        creationDate = `${creationDay}/${creationMonth}/${creationYear} à ${creationHour}:${creationMinutes}:${cretionsSeconds}`;

        const membres = msg.guild.members;
        const bots = membres.cache.filter(membre => membre.user.bot).size;
        const humains = msg.guild.memberCount - bots;
        const arrayTotalRoles = msg.guild.roles.cache;
        let arrayRoles = [];
        let nbRoles = 0;
        arrayTotalRoles.forEach((role) => {
            if (role.name !== "@everyone") {
                arrayRoles.push(role.name);
                nbRoles++;
            }
        });
        let roles = arrayRoles.join(", ");

        if (nbRoles === 0 || nbRoles === 1) {
            roles += " (" + nbRoles + " rôle)";
        }
        else {
            roles += " (" + nbRoles + " rôles)";
        }

        const salons = msg.guild.channels.cache;
        const nbSalonsTxt = salons.filter(salon => salon.type == "text").size;
        const nbSalonsVocaux = salons.filter(salon => salon.type == "voice").size;
        let emojis = msg.guild.emojis.cache.array();
        const emojisCount = emojis.length;
        let emojisArray = [""];
        let displayedEmojisCount = "";
        if (emojisCount === 0) displayedEmojisCount = "Aucun";
        if (emojisCount === 0 || emojisCount === 1) {
            displayedEmojisCount += " (" + emojisCount + " émoji)";
        }
        else {
            displayedEmojisCount += " (" + emojisCount + " émojis)";
        }

        let i = 0;
        emojis.forEach(emoji => {
            if (emojisArray[i].length + emoji.toString().length > 1024) {
                i++;
                emojisArray.push(emoji.toString())
            }
            else {
                emojisArray[i] += emoji.toString();
            }
        });

        if (emojisArray[i].length + displayedEmojisCount.length > 1024) {
            emojisArray.push(displayedEmojisCount.toString())
        }
        else {
            emojisArray[i] += displayedEmojisCount.toString();
        }

        let informations = new Discord.MessageEmbed()
        .setAuthor(msg.guild.name, msg.guild.owner.user.displayAvatarURL())
        .setColor('#000000')
        .addField("Propriétaire du serveur", msg.guild.owner.user.tag, true)
        .addField("ID du serveur", msg.guild.id, true)
        .addField("Membres", msg.guild.memberCount, true)
        .addField("Humains", humains, true)
        .addField("Bots", bots, true)
        .addField("Niveau de boost", `Niveau ${msg.guild.premiumTier}`, true)
        .addField("Region", msg.guild.region, true)

        let first = true;
        emojisArray.forEach(msg1024 => {
            if (first) {
                informations.addField("Emojis", msg1024);
                first = false;
            }
            else {
                informations.addField("Suite des émojis", msg1024);
            }
        });
        
        informations.addField("Rôles", roles)
        .addField("Salons", nbSalonsTxt + " textuels, " + nbSalonsVocaux + " vocaux", true)
        .addField("Date de création du serveur", creationDate, true)
        .setThumbnail(msg.guild.iconURL())
        .setFooter("Requête de " + msg.author.username, msg.author.displayAvatarURL());
        msg.channel.send(informations);
    }
};