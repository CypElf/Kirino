const { prefix } = require('../config.json');

module.exports = {
	name: 'imsp',
    description: 'Permet de savoir si une Switch est patchée ou vulnérable à Fusée Gelée.',
    guildOnly: false,
    args: true,
    category: "hack",
    aliases: ["ismyswitchpatched"],
    usage: '[type] [numéro de série]',

    async help(bot, msg, helpEmbed) {
        helpEmbed
            .setDescription("Cette commande vous permet de savoir si votre console Nintendo Switch est patchée ou non à Fusée Gelée !")
            .addField("Procédure", "À côté du port de chargement de votre console, vous devriez avoir une étiquette avec des inscriptions comme sur l'image ci-dessous, les 4 premiers caractères représentent le type et le reste le numéro.\nLa commande se fait comme ceci : `" + prefix + "imsp [type] [numéro]` (Mettez un espace entre le type et le numéro !)")
            .addField("Exemple", "`" + prefix + "imsp XAW1 0001953380`")
            .setImage("https://cdn.discordapp.com/attachments/572037440672497674/572777164789776407/IMG_20190423_173227.jpg")

        msg.channel.send(helpEmbed);
    },

	async execute(bot, msg, args) {
        const Discord = require("discord.js");

        let color;
        let status;
        const Green = 0x33cc00;
        const Orange = 0xff6600;
        const Red = 0xff0000;
        const notPatched = "Bonne nouvelle : votre Switch n'est pas patchée !";
        const cannotKnow = "Nous ne pouvons pas déterminer si votre Switch est patchée ou pas, et nous en sommes désolés !";
        const patched = "Pas de chance, votre Switch est patchée !";

        const type = args[0];
        const nSerie = args[1];

        if(!nSerie) return msg.channel.send("Veuillez saisir le numéro de série !");

        if (isNaN(nSerie)) return msg.channel.send("Le numéro de série ne doit comporter que des chiffres !");

        if (type.length != 4) return msg.channel.send("Le type doit contenir 4 caractères !")

        if (nSerie.length != 10) return msg.channel.send("Le numéro de série doit contenir 10 chiffres !");

        // ---------------------------------------------------------------------- comparaisons successives du type

        if (type.toUpperCase() === "XAW1") {
            if (nSerie > "0000000000" && nSerie < "0074000000")
                (color = Green), (status = notPatched);
            else if (nSerie > "0075000000" && nSerie < "0120000000")
                (color = Orange), (status = cannotKnow);
            else if ("0120000000" < nSerie) (color = Red), (status = patched);
        }

        else if (type.toUpperCase() === "XAW4") {
            if (nSerie > "0000000000" && nSerie < "0011000000")
                (color = Green), (status = notPatched);
            else if (nSerie > "0011000000" && nSerie < "0012000000")
                (color = Orange), (status = cannotKnow);
            else if ("0012000000" < nSerie) (color = Red), (status = patched);
        }

        else if (type.toUpperCase() == "XAW7") {
            if (nSerie > "0000000000" && nSerie < "0017800000")
                (color = Green), (status = notPatched);
            else if (nSerie > "0017800000" && nSerie < "0030000000")
                (color = Orange), (status = cannotKnow);
                else if ("0030000000" < nSerie) (color = Red), (status = patched);
        }

        else if (type.toUpperCase() === "XAJ1") {
            if (nSerie > "0000000000" && nSerie < "0020000000")
                (color = Green), (status = notPatched);
            else if (nSerie > "0020000000" && nSerie < "0030000000")
                (color = Orange), (status = cannotKnow);
            else if ("0030000000" < nSerie) (color = Red), (status = patched);
        }

        else if (type.toUpperCase() === "XAJ4") {
            if (nSerie > "0000000000" && nSerie < "0046000000")
                (color = Green), (status = notPatched);
            else if (nSerie > "0046000000" && nSerie < "0060000000")
                (color = Orange), (status = cannotKnow);
            else if ("0060000000" < nSerie) (color = Red), (status = patched);
        }

        else if (type.toUpperCase() === "XAJ7") {
            if (nSerie > "0000000000" && nSerie < "0040000000")
                (color = Green), (status = notPatched);
            else if (nSerie > "0040000000" && nSerie < "0050000000")
                (color = Orange), (status = cannotKnow);
            else if (nSerie > "0050000000") (color = Red), (status = patched);
        }

        else if (type.toUpperCase() === "XAW9") {
            color = Red;
            status = "Les Nintendo Switch avec ce type sont directement modifiées depuis Nintendo et nous n'avons pas d'informations sur ce sujet... mais il est malheureusement très probable qu'elles soient toutes patchées !";
        }

        else if (type.toUpperCase().startsWith("XAK")) {
            color = Orange;
            status = "Nous n'avons pas d'informations sur ce type, nous savons juste qu'il s'agit d'une console coréenne ! Nous ne pouvons donc pas déterminer si elle est patchée ou pas !";
        }

        else if (type.toUpperCase().startsWith("XJE")) {
            color = Red;
            status = "Les Switch Lite sont toutes patchées à Fusée Gelée !";
        }

        else if (type.toUpperCase().startsWith("XKJ")) {
            color = Red;
            status = patched;
        }

        // --------------------------------------------------------------------------------------

        if (!color) return msg.channel.send("Le type et/ou le numéro de série est incorrect ! Veuillez entrer un numéro de série valide !");

        let embed = new Discord.RichEmbed()
            .setTitle("**Résultat**")
            .setColor(color)
            .addField("Type de Série", type.toUpperCase())
            .addField("Numéro de Série", nSerie)
            .addField("Status", status)
            .setFooter("Requête de " + msg.author.username, msg.author.avatarURL);
        msg.channel.send(embed);
    }
};