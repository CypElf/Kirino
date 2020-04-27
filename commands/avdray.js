module.exports = {
	name: "avdray",
    description: "description_avdray",
    guildOnly: true,
	args: false,
	category: "others",
	
	async execute(bot, msg) {
		if (msg.guild.id === bot.config.avdrayID) {
			msg.channel.send("https://discord.gg/btJhreB")
		}
	}
}