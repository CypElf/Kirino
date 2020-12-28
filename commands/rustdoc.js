module.exports = {
	name: "rustdoc",
    guildOnly: false,
    args: true,
    aliases: ["rd"],
    cooldown: 3,
    category: "programming",

    async execute (bot, msg, args) {
        const Discord = require("discord.js")
        const rustDocResearcher = require("../lib/rustdoc/rustdoc_researcher")

        const keywords = args.join(" ")
        let results = rustDocResearcher(keywords)
        // need to apply a fix to the researcher : after first command usage, some entries are not returned by the researcher and some undefined are put in URLs

        let contentNames = ""
        let contentIsArgs = ""
        let contentReturned = ""

        for (let i = 0 ; i < 5 ; i++) {
            const result = results.others[i]
            if (result === undefined) break
            contentNames += "- ["
            if (result.path !== "") contentNames += result.path + "::"
            contentNames += `**${result.name}**](${result.href})`
            if (result.desc !== "") contentNames += " : " + result.desc
            contentNames += "\n"
        }

        for (let i = 0 ; i < 5 ; i++) {
            const result = results.in_args[i]
            if (result === undefined) break
            contentIsArgs += "- ["
            if (result.path !== "") contentIsArgs += result.path + "::"
            contentIsArgs += `**${result.name}**](${result.href})`
            if (result.desc !== "") contentIsArgs += " : " + result.desc
            contentIsArgs += "\n"
        }

        for (let i = 0 ; i < 5 ; i++) {
            const result = results.returned[i]
            if (result === undefined) break
            contentReturned += "- ["
            if (result.path !== "") contentReturned += result.path + "::"
            contentReturned += `**${result.name}**](${result.href})`
            if (result.desc !== "") contentReturned += " : " + result.desc
            contentReturned += "\n"
        }

        let embed = new Discord.MessageEmbed()
            .setTitle(__("results"))
			.setColor('#353535')
			.setThumbnail("https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Rust_programming_language_black_logo.svg/1024px-Rust_programming_language_black_logo.svg.png")
            .setFooter(__("request_from") + msg.author.username, msg.author.displayAvatarURL())

        if (contentNames !== "") embed.addField(__("in_name"), contentNames)
        if (contentIsArgs !== "") embed.addField(__("in_settings"), contentIsArgs)
        if (contentReturned !== "") embed.addField(__("in_return_types"), contentReturned)
        if (contentNames === "" && contentIsArgs === "" && contentReturned === "") embed.addField(__("no_result_title"), __("no_result"))
        
        msg.channel.send(embed)
    }
}