module.exports = {
	name: "learnjavascript",
    description: "description_learnjavascript",
    guildOnly: false,
	args: false,
    category: "programming",
    aliases: ["learnjs"],

	async execute (bot, msg) {
        const Discord = require("discord.js")
        let linksEmbed = new Discord.MessageEmbed()
            .setTitle(__("learn_js"))
            .addField(__("english"), `[JavaScript.info](https://javascript.info/)\n[${__("complete_book")}](https://books.goalkicker.com/JavaScriptBook/)\n[${__("nodejs_book")}](https://books.goalkicker.com/NodeJSBook/)`)
            .addField(__("french"), `[${__("mozilla_guide")}](https://developer.mozilla.org/fr/docs/Web/JavaScript/Guide)`)
            .setThumbnail("https://cdn.pixabay.com/photo/2015/04/23/17/41/javascript-736400_960_720.png")
            .setColor("#E4B400")
		msg.channel.send(linksEmbed)
	}
}