module.exports = {
	name: '3dstocia',
    description: "Envoie un tutoriel pour convertir un .3ds en .cia à l'aide de GodMode9.",
    guildOnly: false,
    args: false,
    category: "hack",

    async execute (bot, msg) {
        const Discord = require('discord.js');
        const emb = new Discord.RichEmbed()
            .addField("Convertir un fichier `.3ds` en `.cia`", "1. Mettez votre fichier `.3ds` dans le dossier `cias` de votre carte SD (s'il n'y est pas, créez le, c'est seulement pour être organisés)\n2. Ouvrez Godmode9 en maintenant `start` au démarrage de votre 3ds\n3. Naviguez vers `[0:] SDCARD` puis `cias`\n4. Appuyez sur `A` sur votre fichier `.3ds` pour le sélectionner, ensuite choisissez `NCSD image options...`, puis `Build CIA from file`\nVotre fichier converti en `.cia` sera envoyé dans le dossier `gm9/out` de votre carte SD")
            .setColor('#DFC900')
            .setFooter("Requête de " + msg.author.username, msg.author.avatarURL);
        msg.channel.send(emb);
        if (msg.channel.type == "text") {
            msg.delete();
        }
    }
};