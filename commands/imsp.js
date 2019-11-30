const { prefix } = require('../config.json');

module.exports = {
	name: 'imsp',
    description: 'Permet de savoir si une Switch est patchée ou vulnérable à Fusée Gelée.',
    guildOnly: false,
    args: true,
    category: "hack",
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
        let Green = 0x33cc00;
        let Orange = 0xff6600;
        let Red = 0xff0000;
        let Y = "Bonne nouvelle : votre Switch n'est pas patchée !";
        let I = "Nous ne pouvons pas déterminer si votre Switch est patchée ou pas, et nous en sommes désolés !";
        let N = "Pas de chance, votre Switch est très probablement patchée !";

        if(!args[1]) {
            return msg.channel.send("Veuillez saisir le numéro de série !");
        }

        if (isNaN(args[1]))
            return msg.channel.send("Le numéro de série ne doit comporter que des chiffres !");
        if (args[1].length > 10)
            return msg.channel.send("Le numéro de série ne peut pas contenir plus de 10 caractères !");
        switch (args[0].toUpperCase()) {
            case "XAW1":
                if (args[1] > "0000000000" && args[1] < "0074000000")
                    (color = Green), (status = Y);
                if (args[1] > "0075000000" && args[1] < "0120000000")
                    (color = Orange), (status = I);
                if ("0120000000" < args[1]) (color = Red), (status = N);
                break;

            case "XAW4":
                if (args[1] > "0000000000" && args[1] < "0011000000")
                    (color = Green), (status = Y);
                if (args[1] > "0011000000" && args[1] < "0012000000")
                    (color = Orange), (status = I);
                if ("0012000000" < args[1]) (color = Red), (status = N);
                break;

            case "XAW7":
                if (args[1] > "0000000000" && args[1] < "0017800000")
                    (color = Green), (status = Y);
                if (args[1] > "0017800000" && args[1] < "0030000000")
                    (color = Orange), (status = I);
                if ("0030000000" < args[1]) (color = Red), (status = N);
                break;

            case "XAJ1":
                if (args[1] > "0000000000" && args[1] < "0020000000")
                    (color = Green), (status = Y);
                if (args[1] > "0020000000" && args[1] < "0030000000")
                    (color = Orange), (status = I);
                if ("0030000000" < args[1]) (color = Red), (status = N);
                break;

            case "XAJ4":
                if (args[1] > "0000000000" && args[1] < "0046000000")
                    (color = Green), (status = Y);
                if (args[1] > "0046000000" && args[1] < "0060000000")
                    (color = Orange), (status = I);
                if ("0060000000" < args[1]) (color = Red), (status = N);
                break;

            case "XAJ7":
                if (args[1] > "0000000000" && args[1] < "0040000000")
                    (color = Green), (status = Y);
                if (args[1] > "0040000000" && args[1] < "0050000000")
                    (color = Orange), (status = I);
                if (args[1] > "0050000000") (color = Red), (status = N);
                break;

            case "XAW9":
                color = Red;
                status = "Les Nintendo Switch avec ce type sont directement modifiées depuis Nintendo et nous n'avons pas d'informations sur ce sujet... mais il est malheureusement très probable qu'elles soient toutes patchées !";
                break;

            case "XAK":
                color = Orange;
                status = "Nous n'avons pas d'informations sur ce type, nous savons juste qu'il s'agit d'une console coréenne ! Nous ne pouvons donc pas déterminer si elle est patchée ou pas !";
                break;

            case "XJE1":
                color = Red;
                status = "Les Switch Lite sont toutes patchées à Fusée Gelée !";
                break;
        }
        if (!color) {
            return msg.channel.send("Le type et/ou le numéro de série est incorrect ! Veuillez entrer un numéro de série valide !");
        }

        let embed = new Discord.RichEmbed()
                .setTitle("**Résultat**")
                .setColor(color)
                .addField("Type de Série", args[0].toUpperCase())
                .addField("Numéro de Série", args[1])
                .addField("Status", status)
                .setFooter("Requête de " + msg.author.username, msg.author.avatarURL);
            msg.channel.send(embed);
    }
};