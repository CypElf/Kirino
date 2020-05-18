module.exports = {
	name: "learncpp",
    description: "description_learncpp",
    guildOnly: false,
	args: false,
	category: "programming",

	async execute (bot, msg) {
        const Discord = require("discord.js")
        let linksEmbed = new Discord.MessageEmbed()
            .addField(__("english"), `[${__("complete_book")}](https://books.goalkicker.com/CPlusPlusBook/)\n[${__("documentation")}](https://en.cppreference.com/w/)`)
            .addField(__("french"), `[Zeste de Savoir](https://zestedesavoir.com/tutoriels/822/la-programmation-en-c-moderne/) (${__("create_account_to_access_beta")})\n[${__("video_formation")}](https://www.youtube.com/playlist?list=PLrSOXFDHBtfFiuDVCjWgQZOeaVws7eQmf) (${__("not_finished")})`)
            .setThumbnail("https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/ISO_C%2B%2B_Logo.svg/1200px-ISO_C%2B%2B_Logo.svg.png")
            .setColor("#6666FF")
		msg.channel.send(linksEmbed)
	}
}