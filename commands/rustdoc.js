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
        const recherche = args[0];
        let HTMLParser = require('node-html-parser');
        let https = require('https');
        let options = {
            host: "doc.rust-lang.org",
            path: "/std/index.html?search=" + recherche
        };

        let request = https.get(options, async (res) => {
            if (res.statusCode != 200) return await msg.channel.send(`Une erreur est survenue : ${res.statusCode}. Réessayez plus tard.`);
            res.setEncoding("utf8");

            let output = "";

            res.on("data", (chunk) => {
                output += chunk
            });

            res.on("end", () => {
                let root = HTMLParser.parse(output);
                console.log(root.querySelector("#search"));
            });

            request.end();
        });
    }
};