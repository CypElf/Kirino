module.exports = {
	name: "avdray",
    description: __("description_avdray"),
    guildOnly: false,
	args: false,
	category: "others",
	
	async execute(bot, msg) {
		msg.channel.send("https://discord.gg/btJhreB");
	}
};