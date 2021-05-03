module.exports = {
	name: "learngit",
    guildOnly: false,
	args: false,

	async execute (bot, msg) {
        const Discord = require("discord.js")
        let linksEmbed = new Discord.MessageEmbed()
            .setTitle(__("learn_git"))   
            .addField(__("english"), `[${__("official_book")}](https://git-scm.com/book/en/v2)\n[Atlassian guide](https://www.atlassian.com/git)`)
            .addField(__("french"), `[${__("official_book")}](https://git-scm.com/book/fr/v2) (${__("english_version_translation")})\n[${__("video_formation")}](https://youtu.be/CEb_JM_hsFw)`)
            .setColor("#DE4C36")
            .setThumbnail("https://cdn.discordapp.com/attachments/714381484617891980/778355939833151488/5847f981cef1014c0b5e48be.png")
            .setFooter(__("request_from") + msg.author.username, msg.author.displayAvatarURL())
		msg.channel.send(linksEmbed)
	}
}