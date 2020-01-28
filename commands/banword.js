module.exports = {
	name: "banword",
    description: "Permet de bannir des mots dans le serveur.",
    guildOnly: true,
    args: true,
    usage: "[mode] {mot1} {mot2}... {motN}",
    modes: ["add", "remove", "list"],
    category: "admin",

    async help (bot, msg, helpEmbed) {
        helpEmbed
            .setDescription("Cette commande permet de bloquer certains mots du serveur.")
            .addField("Procédure", "Cette commande s'utilise comme ceci : `" + bot.config.prefix + this.name + " " + this.usage + "`\nLes modes disponibles sont :\n- `" + this.modes.join("`,\n- `") + "`.");
        msg.channel.send(helpEmbed);
    },

    async execute (bot, msg, [mode, ...mots]) {

        const sqlite3 = require('sqlite3').verbose();
        let db = new sqlite3.Database("./database.db", err => {
            if (err) return msg.channel.send("Impossible d'accéder à la base de données : " + err.message);
        });

        const guild = msg.guild.id;

        if (mode === "add") {
            if (mots.length < 1) return msg.channel.send("Veuillez renseigner un ou plusieurs mots en arguments pour les bloquer.");
            if (!msg.member.hasPermission("MANAGE_MESSAGES")) return msg.channel.send("Vous n'avez pas les permissions suffisantes pour utiliser ce mode. <:warning:568037672770338816>");
            mots.forEach(mot => {
                db.serialize(() => {
                    db.run("INSERT INTO banwords(id,words) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET words=words || ',' || excluded.words", [guild, mot], err => {
                        if (err) return msg.channel.send("Une erreur est survenue pendant l'ajout du mot à la base de données.");
                    });
                });
            });
            let content = "";
            if (mots.length === 1) content = `Le mot \`${mots[0]}\` a bien été ajouté aux mots bannis.`;
            else {
                content = "Les mots `" + mots.join("`, `") + "` ont bien tous été ajoutés aux mots bannis."
            }
            msg.channel.send(content);
        }

        else if (mode === "list") {
            let liste = "Voici la liste des mots actuellement bannis :\n";
            db.serialize(() => {
                db.get("SELECT * FROM banwords WHERE id=(?)", [guild], (err, row) => {
                    if (err) return msg.channel.send("Impossible d'accéder aux mots bannis dans la base de données.");
                    if (row === undefined || row.words === undefined) liste = "Ce serveur n'a aucun mot bloqué pour l'instant.";
    
                    else {
                        const contenu = row.words.split(",");
                        contenu.forEach(word => {
                            liste += "`" + word + "`, ";
                        });
                        liste = liste.substring(0, liste.length - 2); // -2 pour supprimer l'espace et la virgule tout à la fin
                    }   
                    msg.channel.send(liste);
                });
            }); 
        }

        else if (mode === "remove") {
            if (mots.length < 1) return msg.channel.send("Veuillez renseigner un ou plusieurs mots en arguments pour les débloquer.");
            if (!msg.member.hasPermission("MANAGE_MESSAGES")) return msg.channel.send("Vous n'avez pas les permissions suffisantes pour utiliser ce mode. <:warning:568037672770338816>");
            let bannedWords;
            let removed = [];
            let notRemoved = [];
            db.serialize(() => {
                db.get("SELECT * FROM banwords WHERE id=(?)", [guild], (err, row) => {
                    if (err) return msg.channel.send("Impossible d'accéder aux mots bannis dans la base de données.");
                    if (row === undefined || row.words === undefined) return msg.channel.send("Ce serveur n'a actuellement aucun mot bloqué.");
                    bannedWords = row.words.split(",");

                    mots.forEach(mot => {
                        if (bannedWords.includes(mot)) {
                            bannedWords = bannedWords.filter(bannedWord => bannedWord !== mot);
                            removed.push(mot);
                        }
                        else {
                            notRemoved.push(mot);
                        }
    
                        if (bannedWords.length < 1) {
                            db.run("DELETE FROM banwords WHERE id=(?)", [guild], err => {
                                if (err) return msg.channel.send("Une erreur est survenue durant la suppression de la ligne de mots bannis de ce serveur dans la base de données : " + err.message);
                            });
                        }
                        else {
                            db.run("INSERT INTO banwords(id,words) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET words=excluded.words", [guild, bannedWords.join(",")], err => {
                                if (err) return msg.channel.send("Une erreur est survenue pendant la suppression du mot de la base de données : " + err.message);
                            });
                        }
                    });

                    let answer = "";
                    if (removed.length === 0) {
                        answer += "Aucun mot n'a été supprimé de la liste des mots bloqués.\n";
                    }
                    else {
                        answer += "Les mots suivants ont bien été supprimés des mots bloqués : `" + removed.join("`, `") + "`\n";
                    }
                    if (notRemoved.length > 0) {
                        answer += "Les mots suivants n'ont pas été trouvés dans les mots bloqués et n'ont donc pas été supprimés : `" + notRemoved.join("`, `") + "`";
                    }
                    msg.channel.send(answer);
    
                    db.close(err => {
                        if (err) return msg.channel.send("Une erreur est survenue durant la fermture de la connexion avec la base de donnée : " + err.message);
                    });
                });
            });
        }

        else {
            return msg.channel.send("Veuillez renseigner un mode valide.");
        }
    }
};