const { Permissions } = require("discord.js")

module.exports = {
    name: "prefix",
    guildOnly: false,
    args: true,
    cooldown: 5,
    permissions: ["manage guild"],

    async execute(bot, msg, args) {
        if (msg.guild && !msg.member.permissions.has(Permissions.FLAGS.MANAGE_GUILD)) return msg.channel.send(__("missing_permissions_to_execute_this_command"))

        if (args.length > 1) return msg.channel.send(__("no_spaces_in_prefixs"))
        const newPrefix = args[0]
        if (newPrefix.length > 3) return msg.channel.send(__("three_chars_max"))

        const prefixRequest = bot.db.prepare("INSERT INTO prefixs(id,prefix) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET prefix=excluded.prefix")
        const resetRequest = bot.db.prepare("DELETE FROM prefixs WHERE id = ?")

        let id
        if (msg.guild) id = msg.guild.id
        else id = msg.author.id

        if (newPrefix === ";") resetRequest.run(id)
        else prefixRequest.run(id, newPrefix)

        msg.channel.send(`${__("new_prefix_is_now")} \`${newPrefix}\` ${__("kirino_glad")} !`)
    }
}