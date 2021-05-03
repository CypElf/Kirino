module.exports = {
	name: "learnc",
    guildOnly: false,
	args: false,

	async execute (bot, msg) {
        const Discord = require("discord.js")
        let linksEmbed = new Discord.MessageEmbed()
            .setTitle(__("learn_c"))
            .addField(__("english"), `[${__("complete_book")}](https://books.goalkicker.com/CBook/)\n[${__("documentation")}](https://devdocs.io/c/)`)
            .addField(__("french"), `[Zeste de Savoir](https://zestedesavoir.com/tutoriels/755/le-langage-c-1/)\n[${__("video_formation")}](https://www.youtube.com/playlist?list=PLrSOXFDHBtfEh6PCE39HERGgbbaIHhy4j)`)
            .setThumbnail("https://cdn.clipart.email/8ef145e648d53d25446c87ee512b638e_png-logo-download-transparent-png-clipart-free-download-ywd_1600-1600.png")
            .setColor("#6666FF")
            .setFooter(__("request_from") + msg.author.username, msg.author.displayAvatarURL())
		msg.channel.send(linksEmbed)
	}
}