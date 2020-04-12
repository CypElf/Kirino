module.exports = {
	name: 'rustdoc',
    description: "Permet de récupérer les résultats d'une recherche dans la documentation de Rust. Version actuelle : 1.42.0",
    guildOnly: false,
    args: true,
    usage: "[mot à rechercher]",
    category: "others",

    async execute (bot, msg, args) {
        const Discord = require('discord.js');
        const rustDocResearcher = require('./rustdoc_logic/rustdoc_researcher');

        const keyword = args[0];
        const results = rustDocResearcher(keyword);
        
        let counter = 0;
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

        if (contentNames === "" && contentIsArgs === "" && contentReturned === "") {
            embed.addField("Aucuns résultats", "Rien ne correspondant à votre recherche n'a été trouvé.")
        }
        
        msg.channel.send(embed);
    }
};