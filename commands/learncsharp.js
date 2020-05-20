module.exports = {
	name: "learncsharp",
    description: "description_learncsharp",
    guildOnly: false,
	args: false,
    category: "programming",
    aliases: ["learncs"],

	async execute (bot, msg) {
        const Discord = require("discord.js")
        let linksEmbed = new Discord.MessageEmbed()
            .setTitle(__("learn_csharp"))
            .addField(__("english"), `[${__("microsoft_learning_cs_material")}](https://dotnet.microsoft.com/learn/csharp)\n[C# 101](https://www.youtube.com/playlist?list=PLdo4fOcmZ0oVxKLQCHpiUWun7vlJJvUiN)\n[${__("documentation")} C#](https://docs.microsoft.com/en-us/dotnet/csharp/)\n[ASP.NET](https://docs.microsoft.com/en-us/aspnet/)`)
            .addField(__("french"), `[${__("documentation")} C#](https://docs.microsoft.com/fr-fr/dotnet/csharp/)\n[ASP.NET](https://docs.microsoft.com/fr-fr/aspnet/)\n[${__("video_formation")}](https://www.youtube.com/playlist?list=PLrSOXFDHBtfGBHAMEg9Om9nF_7R7h5mO7) (${__("not_finished")})`)
            .setThumbnail("https://seeklogo.com/images/C/c-sharp-c-logo-02F17714BA-seeklogo.com.png")
            .setColor("#AA33FF")
            .setFooter(__("request_from") + msg.author.username, msg.author.displayAvatarURL())
		msg.channel.send(linksEmbed)
	}
}