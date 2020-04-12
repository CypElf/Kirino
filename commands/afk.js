module.exports = {
	name: 'afk',
    description: 'Permet de laisser un message à ceux qui voudraient vous mentionner pendant que vous êtes AFK. La raison est optionnelle.',
    guildOnly: true,
    args: false,
    category: "others",
    usage: "{raison de l'absence}",

    async execute (bot, msg, args) {
        const sqlite3 = require('sqlite3').verbose();
        let db = new sqlite3.Database("./database.db", err => {
            if (err) return console.log("Impossible d'accéder à la base de données : " + err.message);
        });

        db.serialize(() => {
            let reason;
            if (args) {
                reason = args.join(' ');
            }

            db.run("INSERT INTO afk(id,reason) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET reason=excluded.reason", [msg.author.id, reason], err => {
                if (err) return console.log("Une erreur est survenue pendant l'ajout du profil à la base de données AFK : " + err.message);
            });

            db.close(err => {
                if (err) return console.log("Une erreur est survenue durant la fermture de la connexion avec la base de donnée : " + err.message);
            });

            if (reason) {
                return msg.reply(`tu as bien été mis AFK pour la raison suivante <:kirinoglad:698923046819594351> : ${reason}`);
            }
            else {
                return msg.reply(`tu as bien été mis AFK. <:kirinoglad:698923046819594351>`);
            }
        });
    }
};