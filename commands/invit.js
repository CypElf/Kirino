module.exports = {
	name: "invit",
    description: "description_invit",
    guildOnly: false,
	args: false,
	category: "others",
	
	async execute(bot, msg) {
		const Discord = require('discord.js')
        const emb = new Discord.MessageEmbed()
			.addField(__("invit_bot") + " **" + bot.user.username + "** " + __("on_a_server"), __("the_link_to_invit_me_is_available") + " **" + __("here") + "(https://discordapp.com/oauth2/authorize?client_id=493470054415859713&scope=bot&permissions=8)**")
			.setColor('#DFC900')
			.setFooter(__("request_from") + msg.author.username, msg.author.avatarURL())
		msg.channel.send(emb)
	}
}