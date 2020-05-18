module.exports = {
	name: "learnreverse",
    description: "description_learnreverse",
    guildOnly: false,
	args: false,
    category: "programming",
    aliases: ["learnre"],

	async execute (bot, msg) {
        const Discord = require("discord.js")
        let linksEmbed = new Discord.MessageEmbed()
            .addField(__("some_tools"), "[GDB](https://www.gnu.org/software/gdb/)\n[IDA](https://www.hex-rays.com/products/ida/)\n[Radare2](https://rada.re/)\n[Java Decompiler](http://java-decompiler.github.io/)")
            .addField(__("english"), `[${__("reverse_for_beginners")}](https://www.begin.re/)\n[${__("x86_nasm_by_example")}](https://asmtutor.com/)\n[${__("what_is_a_linux_executable")}](https://fasterthanli.me/blog/2020/whats-in-a-linux-executable/)\n[Crackmes](https://crackmes.one/)`)
            .addField(__("french"), `[${__("nasm_x86_course")}](http://www.pageperso.lif.univ-mrs.fr/~alexis.nasr/Ens/Compilation/cm06_x86.pdf)\n[Hackndo](https://beta.hackndo.com/archives/) (${__("contains_many_articles")})`)
			.setThumbnail("https://cdn.icon-icons.com/icons2/1155/PNG/512/1486564730-gears-cogs_81537.png")
            .setColor("#888888")
		msg.channel.send(linksEmbed)
	}
}