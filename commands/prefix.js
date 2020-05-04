module.exports = {
	name: "prefix",
    description: "description_prefix",
    guildOnly: false,
    args: true,
    usage: "usage_prefix",
	category: "others",
	
	async execute(bot, msg, args) {
        if (args.length > 1) return msg.channel.send("Les préfixes ne doivent pas avoir d'espace")
        const newPrefix = args[0]
        if (newPrefix.length > 3) return msg.channel.send("Les préfixes sont limités à 3 caractères maximum.")

        const bsqlite3 = require("better-sqlite3")
        let db = new bsqlite3("database.db", { fileMustExist: true })       
        const prefixRequest = db.prepare("INSERT INTO prefixs(id,prefix) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET prefix=excluded.prefix")

        let id
        if (msg.channel.type === "text") id = msg.guild.id
        else id = msg.author.id

        prefixRequest.run(id, newPrefix)

        msg.channel.send("Le préfixe est maintenant" + " `" + newPrefix + "` <:kirinoglad:698923046819594351> !")
	}
}