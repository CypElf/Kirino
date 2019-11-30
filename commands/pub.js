module.exports = {
	name: 'pub',
    description: 'Envoie le lien du serveur de mon créateur.',
    guildOnly: false,
	args: false,
	category: "others",
	
	async execute(bot, msg) {
		msg.channel.send("https://discord.gg/btJhreB");
	}
};