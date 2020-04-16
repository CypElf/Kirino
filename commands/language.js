module.exports = {
	name: "language",
    description: "Permet de changer la langue dans laquelle je suis.\nLes langues disponibles sont `en` pour l'anglais et `fr` pour le français.",
    guildOnly: false,
    args: true,
    usage: "[langue]",
    category: "admin",

	async execute (bot, msg, args) {
        const language = args[0];
        if (!getLocales().includes(language)) {
            return msg.channel.send("Le code de language saisi est incorrect. <:kirinopout:698923065773522944>");
        }

        const sqlite3 = require('sqlite3').verbose();
        let db = new sqlite3.Database("./database.db", err => {
            if (err) return console.log("Impossible d'accéder à la base de données : " + err.message);
        });

        let id;
        if (msg.channel.type === "text") id = msg.guild.id;
        else id = msg.author.id;

        db.serialize(() => {
            db.run("INSERT INTO languages(id,language) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET language=excluded.language", [id, language], err => {
                if (err) return console.log("Une erreur est survenue pendant l'ajout du langage à la base de données : " + err.message);
            });

            db.close(err => {
                if (err) return console.log("Une erreur est survenue durant la fermeture de la connexion avec la base de données : " + err.message);
            });

            if (msg.channel.type === "text") {
                msg.channel.send(`La langue du serveur a correctement été définie à \`${language}\` <:kirinoglad:698923046819594351> !`);
            }
            else {
                msg.channel.send(`La langue de vos messages privés a correctement été définie à \`${language}\` <:kirinoglad:698923046819594351> !`);
            }

            let callerID;
            if (msg.channel.type === "text") callerID = msg.guild.id;
            else callerID = msg.author.id;

            setLocale(language);
        });
	}
};