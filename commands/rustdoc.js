module.exports = {
	name: 'rustdoc',
    description: "Permet de récupérer les résultats d'une recherche dans la documentation de Rust.",
    guildOnly: false,
    args: true,
    usage: "[mot à rechercher]",
    category: "others",

    async help(bot, msg, helpEmbed) {
		helpEmbed
			.setDescription("Cette commande permet de faire une recherche dans la documentation de Rust.")
			.addField("Procédure", "Cette commande s'utilise comme ceci : `" + bot.config.prefix + this.name + " " + this.usage + "`");
		msg.channel.send(helpEmbed);
	},

    async execute (bot, msg, args) {
        const Discord = require('discord.js');
        const rustDocResearcher = require('./rustdoc_logic/rustdoc_researcher');

        const keyword = args[0];
        const results = rustDocResearcher(keyword);
        
        let counter = 0;
        let personalCounter = 0;
        let contentNames = "";
        let contentIsArgs = "";
        let contentReturned = "";

        for (let result of results.others) {
            if (counter >= 5) break;
            contentNames += "- [";
            if (result.path !== "") {
                contentNames += result.path + "::";
            }
            contentNames += "**" + result.name + "**](" + result.href + ")";
            if (result.desc !== "") {
                contentNames += " : " + result.desc;
            }
            contentNames += "\n";
            personalCounter++;
            counter++;
        }

        counter = 0;
        for (let result of results.in_args) {
            if (counter >= 5) break;
            contentIsArgs += "- [";
            if (result.path !== "") {
                contentIsArgs += result.path + "::";
            }
            contentIsArgs += "**" + result.name + "**](" + result.href + ")";
            if (result.desc !== "") {
                contentIsArgs += " : " + result.desc;
            }
            contentIsArgs += "\n";
            personalCounter++;
            counter++;
        }

        counter = 0;
        for (let result of results.returned) {
            if (counter >= 5) break;
            contentReturned += "- [";
            if (result.path !== "") {
                contentReturned += result.path + "::";
            }
            contentReturned += "**" + result.name + "**](" + result.href + ")";
            if (result.desc !== "") {
                contentReturned += " : " + result.desc;
            }
            contentReturned += "\n";
            personalCounter++;
            counter++;
        }

        let embed = new Discord.RichEmbed()
            .setTitle("Résultats")
			.setColor('#353535')
			.setThumbnail("https://doc.rust-lang.org/rust-logo1.40.0.png")
            .setFooter("Requête de " + msg.author.username, msg.author.avatarURL);

        if (contentNames !== "") {
            embed.addField("Dans le nom", contentNames);
        }

        if (contentIsArgs !== "") {
            embed.addField("Dans les paramètres", contentIsArgs);
        }

        if (contentReturned !== "") {
            embed.addField("Dans les types de retour", contentReturned);
        }

        if (contentNames === "" && contentIsArg === "" && contentReturned === "") {
            embed.addField("Aucuns résultats", "Rien ne correspondant à votre recherche n'a été trouvé.")
        }
        
        msg.channel.send(embed);
    }
};