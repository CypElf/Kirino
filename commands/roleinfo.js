const Discord = require('discord.js');

module.exports = {
	name: 'roleinfo',
    description: "Affiche des informations sur le rôle mentionné ou exactement nommé.",
    guildOnly: true,
    args: true,
    usage: '[rôle]',
    aliases: ["ri"],
    category: "others",
    
    async execute(bot, msg, argsArray) {
        let role = msg.mentions.roles.first();

        if(!role) {
            let r = "";
            argsArray.forEach(element => {
                r += element + " ";
            });
            r = r.substring(0, r.length - 1);
            role = msg.guild.roles.array().find((currentRole) => {
                return currentRole.name.toLowerCase() === r.toLowerCase();
            });
            if (role === undefined) {
                return msg.channel.send("Veuillez mentionner ou écrire un rôle correct du serveur. <:warning:568037672770338816>");
            }
        }

        // ------------------------------------------ //

        let creationDate = role.createdAt;
        const creationMonth = String(creationDate.getMonth() + 1).padStart(2, "0");
        const creationDay = String(creationDate.getDate()).padStart(2, "0");
        const creationYear = creationDate.getFullYear();
        const creationHour = String(creationDate.getHours()).padStart(2, "0");
        const creationMinutes = String(creationDate.getMinutes()).padStart(2, "0");
        const cretionsSeconds = String(creationDate.getSeconds()).padStart(2, "0");
        creationDate = `${creationDay}/${creationMonth}/${creationYear} à ${creationHour}:${creationMinutes}:${cretionsSeconds}`;
        
        const porteurs = role.members.array().length;
        const membresServeur = msg.guild.members.array().length;
        const percentage = (porteurs / membresServeur * 100).toPrecision(3);
        let perms = "";

        for (let flag in Discord.Permissions.FLAGS) {
            if (role.hasPermission(flag)) {
                perms += "`" + flag.toLowerCase().replace(/_/g, " ") + "`, ";
            }
        }
        perms = perms.substring(0, perms.length - 2);

        let informations = new Discord.RichEmbed()
        .setAuthor("Rôle : " + role.name)
        .setColor(role.hexColor)
        .addField("ID", role.id, true)
        .addField("Couleur", role.hexColor.toUpperCase(), true)
        .addField("Mentionnable", role.mentionable ? "oui" : "non", true)
        .addField("Catégorie séparée", role.hoist ? "oui" : "non", true)
        .addField("Position", role.calculatedPosition, true)
        .addField("Géré par l'extérieur", role.managed ? "oui" : "non", true)
        .addField("Utilisateurs avec ce rôle", porteurs + " (" + percentage + "%)")
        .addField("Date de création du rôle", creationDate, true)
        .addField("Permissions", perms !== "" ? perms : "`Ce rôle n'a aucune permission`")
        .setFooter("Requête de " + msg.author.username, msg.author.avatarURL);
        msg.channel.send(informations);
    }
};