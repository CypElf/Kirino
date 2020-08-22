module.exports = {
	name: "about",
    description: "description_about",
    guildOnly: false,
	args: false,
	category: "others",
	
	async execute(bot, msg) {
		msg.channel.send(`${__("about_first_part") + bot.user.username + __("remaining_about")} ${__("kirino_glad")}`)
	}
}