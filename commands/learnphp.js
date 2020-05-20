module.exports = {
	name: "learnphp",
    description: "description_learnphp",
    guildOnly: false,
	args: false,
    category: "programming",

	async execute (bot, msg) {
        const Discord = require("discord.js")
        let linksEmbed = new Discord.MessageEmbed()
            .setTitle(__("learn_php"))   
            .addField(__("english"), `[PHP the right way](https://phptherightway.com/)\n[${__("php_security_checklist")}](https://www.sqreen.com/checklists/php-security-checklist)\n[${__("documentation")}](https://www.php.net/docs.php)`)
            .addField(__("french"), `[PHP the right way](https://eilgin.github.io/php-the-right-way/) (${__("english_version_translation")})\n[${__("video_formation")}](https://www.youtube.com/playlist?list=PLrSOXFDHBtfFuZttC17M-jNpKnzUL5Adc)`)
			.setThumbnail("https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/PHP-logo.svg/1024px-PHP-logo.svg.png")
            .setColor("#9999FF")
            .setFooter(__("request_from") + msg.author.username, msg.author.displayAvatarURL())
		msg.channel.send(linksEmbed)
	}
}