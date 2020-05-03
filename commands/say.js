module.exports = {
	name: "say",
    description: "description_say",
    guildOnly: true,
    args: true,
    category: "others",
    usage: "usage_say",
    
    async execute(bot, msg, args) {
		if (msg.author.id !== bot.config.ownerID && msg.author.id !== msg.guild.ownerID) {
            return msg.channel.send(__("not_allowed_to_use_this_command") + " <:kirinopff:698922942268047391>")
                .then(msg => msg.delete({ timeout: 5000 }))
                .catch()
        }
        let text = args.join(" ")
        msg.channel.send(text)
            .then(() => {
                if (msg.channel.type == 'text') {
                    msg.delete({ timeout: 4 })
                        .catch()
                }
            })
            .catch()
    }
}
