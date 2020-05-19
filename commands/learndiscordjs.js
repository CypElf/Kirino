module.exports = {
	name: "learndiscordjs",
    description: "description_discordjs",
    guildOnly: false,
	args: false,
    category: "programming",
    aliases: ["learndjs"],

	async execute (bot, msg) {
        const Discord = require("discord.js")
        let linksEmbed = new Discord.MessageEmbed()
            .setTitle(__("learn_discordjs"))
            .addField(__("english"), `[${__("complete_course")}](https://discordjs.guide/)\n[${__("documentation")}](https://discord.js.org/#/docs/main/stable/general/welcome)`)
			.setThumbnail("https://upload.wikimedia.org/wikipedia/fr/thumb/0/05/Discord.svg/1200px-Discord.svg.png")
            .setColor("#7777FF")
		msg.channel.send(linksEmbed)
	}
}