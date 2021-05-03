module.exports = {
	name: "say",
    guildOnly: true,
    args: true,
    permissions: ["administrator"],
    
    async execute(bot, msg, args) {
		if (msg.author.id !== process.env.OWNER_ID && !msg.member.hasPermission("ADMINISTRATOR")) {
            return msg.channel.send(`${__("not_allowed_to_use_this_command")} ${__("kirino_pff")}`)
                .then(msg => msg.delete({ timeout: 5000 })).catch(() => {})
        }
        let text = args.join(" ")
        msg.channel.send(text)
            .then(() => {
                if (msg.guild) {
                    msg.delete({ timeout: 4 }).catch(() => {})
                }
            })
    }
}
