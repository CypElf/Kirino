module.exports = {
	name: 'rustdoc',
    description: "Permet de récupérer les résultats d'une recherche dans la documentation de Rust.",
    guildOnly: false,
    args: false,
    category: "others",

    async help(bot, msg, helpEmbed) {
		helpEmbed
			.setDescription("Cette commande sert à supprimer le nombre de messages voulus.")
			.addField("Procédure", "Cette commande s'utilise comme ceci : `" + config.prefix + this.name + " " + this.usage + "`");
		msg.channel.send(helpEmbed);
	},

    async execute (bot, msg) {
        let https = require('https');
        let options = {
            host: 'doc.rust-lang.org',
            path: '/std/index.html'
        };

        let request = https.get(options, res => {
            if (res.statusCode != 200) return msg.channel.send(`Une erreur est survenue : ${res.statusCode}. Réessayez plus tard.`);
            else return console.log(`Yes ! Victoire ! Status : ${res.statusCode}`);
        });
    }
};