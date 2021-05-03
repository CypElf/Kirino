module.exports = {
	name: "learnhtml",
    guildOnly: false,
    args: false,
    aliases: ["learncss"],

	async execute (bot, msg) {
        const Discord = require("discord.js")
        let linksEmbed = new Discord.MessageEmbed()
            .setTitle(__("learn_html"))
            .addField(__("english"), `[${__("mdn_guide")}](https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web)\n[${__("interneting_is_hard")}](https://www.internetingishard.com/)\n[${__("freecodecamp")}](https://www.freecodecamp.org/)\n[${__("html_book")}](https://www.freecodecamp.org/)\n[${__("css_book")}](https://books.goalkicker.com/CSSBook/)\n[${__("marksheet")}](https://marksheet.io/)\n[${__("mdn")}](https://developer.mozilla.org/en/)`)
            .addField(__("french"), `[${__("mdn_guide")}](https://developer.mozilla.org/fr/docs/Apprendre/Commencer_avec_le_web)\n[${__("grafikart_html")}](https://grafikart.fr/formations/html)\n[${__("grafikart_css")}](https://grafikart.fr/formations/css)\n[${__("mdn")}](https://developer.mozilla.org/fr/)`)
			.setThumbnail("https://cdn.discordapp.com/attachments/714381484617891980/805771805741547590/htmlcss.png")
            .setColor("#E44D26")
            .setFooter(__("request_from") + msg.author.username, msg.author.displayAvatarURL())
		msg.channel.send(linksEmbed)
	}
}