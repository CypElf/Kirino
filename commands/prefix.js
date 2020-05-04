module.exports = {
	name: "prefix",
    description: "description_prefix",
    guildOnly: false,
    args: true,
    usage: "usage_prefix",
	category: "others",
	
	async execute(bot, msg, args) {
        if (msg.channel.type === "text" && !msg.member.hasPermission("MANAGE_GUILD")) return msg.channel.send(__("missing_permissions_to_execute_this_command"))

        if (args.length > 1) return msg.channel.send(__("no_spaces_in_prefixs"))
        const newPrefix = args[0]
        if (newPrefix.length > 3) return msg.channel.send(__("three_chars_max"))

        const bsqlite3 = require("better-sqlite3")
        let db = new bsqlite3("database.db", { fileMustExist: true })       
        const prefixRequest = db.prepare("INSERT INTO prefixs(id,prefix) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET prefix=excluded.prefix")

        let id
        if (msg.channel.type === "text") id = msg.guild.id
        else id = msg.author.id

        prefixRequest.run(id, newPrefix)

        msg.channel.send(__("new_prefix_is_now") + " `" + newPrefix + "` <:kirinoglad:698923046819594351> !")
	}
}