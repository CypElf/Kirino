module.exports = {
	name: "say",
    guildOnly: true,
    args: true,
    permissions: ["administrator"],
    
    async execute(bot, msg, args) {
        const { Permissions } = require("discord.js")
		if (msg.author.id !== process.env.OWNER_ID && !msg.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
            return msg.channel.send(`${__("not_allowed_to_use_this_command")} ${__("kirino_pff")}`)
                .then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000)).catch(() => {})
        }
        let text = args.join(" ")
        msg.channel.send(text)
            .then(() => {
                if (msg.guild) {
                    setTimeout(() => msg.delete().catch(() => {}), 5000)
                }
            })
    }
}
