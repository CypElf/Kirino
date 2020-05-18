module.exports = {
	name: "learnrust",
    description: "description_learnrust",
    guildOnly: false,
	args: false,
    category: "programming",
    aliases: ["learnrs"],

	async execute (bot, msg) {
        const Discord = require("discord.js")
        let linksEmbed = new Discord.MessageEmbed()
            .setTitle(__("learn_rust"))
            .addField(__("english"), `[${__("official_book")}](https://doc.rust-lang.org/book/)\n[${__("official_course_by_example")}](https://doc.rust-lang.org/stable/rust-by-example/)\n[Are we game yet?](http://arewegameyet.com/) (${__("game_development")})\n[${__("documentation")}](https://doc.rust-lang.org/std/)`)
            .addField(__("french"), `[${__("guillaume_gomez_blog")}](https://blog.guillaume-gomez.fr/Rust/)\n[${__("video_formation")}](https://www.youtube.com/playlist?list=PLFxge2NokeDu8tP7uDfy8VUZOIS0tADNp)`)
			.setThumbnail("https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Rust_programming_language_black_logo.svg/1024px-Rust_programming_language_black_logo.svg.png")
            .setColor("#555555")
		msg.channel.send(linksEmbed)
	}
}