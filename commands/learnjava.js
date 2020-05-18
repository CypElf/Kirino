module.exports = {
	name: "learnjava",
    description: "description_learnjava",
    guildOnly: false,
	args: false,
    category: "programming",

	async execute (bot, msg) {
        const Discord = require("discord.js")
        let linksEmbed = new Discord.MessageEmbed()
            .addField(__("english"), `[${__("complete_book")}](https://books.goalkicker.com/JavaBook/)\n[${__("documentation")}](https://docs.oracle.com/javase)`)
            .addField(__("french"), `[${__("complete_course")}](https://koor.fr/Java/Tutorial/Index.wp) (${__("also_available")} [${__("on_youtube")}](https://www.youtube.com/playlist?list=PLBNheBxhHLQxfJhoz193-dRwvc2rl8AOW) ${__("as_video_formation")})\n[${__("video_formation")}](https://www.youtube.com/playlist?list=PLrSOXFDHBtfHkq8dd3BbSaopVgRSYtgPv) (${__("not_finished")})`)
			.setThumbnail("http://assets.stickpng.com/images/58480979cef1014c0b5e4901.png")
            .setColor("#6666FF")
		msg.channel.send(linksEmbed)
	}
}