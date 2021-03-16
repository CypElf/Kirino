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

        const replaceAll = require("../lib/string/replace_all")

        for (const result of results.others) {
            if (result === undefined) break

            contentNames += "- ["
            if (result.path !== "") contentNames += result.path + "::"
            contentNames += `**${result.name}**](${result.href})`
            if (result.desc !== "") contentNames += " : " + replaceAll(replaceAll(result.desc, "<code>", "`"), "</code>", "`")
            contentNames += "\n"
        }

        for (const result of results.in_args) {
            if (result === undefined) break

            contentIsArgs += "- ["
            if (result.path !== "") contentIsArgs += result.path + "::"
            contentIsArgs += `**${result.name}**](${result.href})`
            if (result.desc !== "") contentIsArgs += " : " + replaceAll(replaceAll(result.desc, "<code>", "`"), "</code>", "`")
            contentIsArgs += "\n"
        }

        for (const result of results.returned) {
            if (result === undefined) break

            let buffer = "- ["
            if (result.path !== "") buffer += result.path + "::"
            buffer += `**${result.name}**](${result.href})`
            if (result.desc !== "") buffer += " : " + replaceAll(replaceAll(result.desc, "<code>", "`"), "</code>", "`")
            buffer += "\n"

            if (contentReturned.length + buffer.length <= 1024) contentReturned += buffer
            else break
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