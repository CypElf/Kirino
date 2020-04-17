module.exports = {
	name: "language",
    description: __("description_language"),
    guildOnly: false,
    args: true,
    usage: __("usage_language"),
    category: "admin",

	async execute (bot, msg, args) {

        if (msg.channel.type === "text") {
            if (!msg.member.hasPermission("MANAGE_GUILD")) {
                return msg.channel.send(__("not_enough_permission_to_change_language") + " <:kirinopout:698923065773522944>");
            }
        }

        const language = args[0];
        if (!getLocales().includes(language)) {
            return msg.channel.send(__("bad_language_code") + " <:kirinopout:698923065773522944>");
        }

        const bsqlite3 = require("better-sqlite3");
        let db = new bsqlite3("database.db")

        let id;
        if (msg.channel.type === "text") id = msg.guild.id;
        else id = msg.author.id;

        const insertLanguageRequest = db.prepare("INSERT INTO languages(id,language) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET language=excluded.language");
        insertLanguageRequest.run(id, language);

        db.close();

        if (msg.channel.type === "text") {
            msg.channel.send(__("server_language_changed") + language + "` <:kirinoglad:698923046819594351> !");
        }
        else {
            msg.channel.send(__("dm_language_changed") + language + "` <:kirinoglad:698923046819594351> !");
        }

        setLocale(language);
	}
};