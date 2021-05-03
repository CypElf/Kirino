module.exports = {
	name: "language",
    guildOnly: false,
    args: true,
    aliases: ["lang"],
    cooldown: 5,
    permissions: ["manage guild"],

	async execute (bot, msg, args) {

        if (msg.guild) {
            if (!msg.member.hasPermission("MANAGE_GUILD")) {
                return msg.channel.send(`${__("not_enough_permission_to_change_language")} ${__("kirino_pout")}`)
            }
        }

        const language = args[0]
        if (!getLocales().includes(language)) {
            return msg.channel.send(`${__("bad_language_code")} ${__("kirino_pout")}`)
        }

        let id
        if (msg.guild) id = msg.guild.id
        else id = msg.author.id

        const insertLanguageRequest = bot.db.prepare("INSERT INTO languages(id,language) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET language=excluded.language")
        insertLanguageRequest.run(id, language)

        setLocale(language)

        if (msg.guild) {
            msg.channel.send(`${__("server_language_changed") + language}\` ${__("kirino_glad")} !`)
        }
        else {
            msg.channel.send(`${__("dm_language_changed") + language}\` ${__("kirino_glad")} !`)
        }
	}
}