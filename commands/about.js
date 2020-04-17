module.exports = {
	name: "about",
    description: __("description_about"),
    guildOnly: false,
	args: false,
	category: "others",
	
	async execute(bot, msg) {
		msg.channel.send(__("i_am") + bot.user.username + __("remaining_about"));
	}
};