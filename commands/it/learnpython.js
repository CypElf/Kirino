module.exports = {
	name: "learnpython",
    guildOnly: false,
	args: false,
    aliases: ["learnpy"],

	async execute (bot, msg) {
        const Discord = require("discord.js")
        let linksEmbed = new Discord.MessageEmbed()
            .setTitle(__("learn_python"))
            .addField(__("english"), `[${__("complete_book")}](https://books.goalkicker.com/PythonBook/)\n[${__("documentation")}](https://docs.python.org/3/)`)
            .addField(__("french"), `[${__("pdf_course")}](https://inforef.be/swi/download/apprendre_python3_5.pdf)\n[${__("video_formation")}](https://www.youtube.com/playlist?list=PLrSOXFDHBtfHg8fWBd7sKPxEmahwyVBkC)`)
			.setThumbnail("https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Python-logo-notext.svg/1200px-Python-logo-notext.svg.png")
            .setColor("#6666FF")
            .setFooter(__("request_from") + msg.author.username, msg.author.displayAvatarURL())
		msg.channel.send(linksEmbed)
	}
}