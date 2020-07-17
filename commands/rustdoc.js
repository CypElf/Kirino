module.exports = {
	name: "rustdoc",
    description: "description_rustdoc",
    guildOnly: false,
    args: true,
    usage: "usage_rustdoc",
    aliases: ["rd"],
    cooldown: 3,
    category: "programming",

    async execute (bot, msg, args) {
        const Discord = require("discord.js")
        const rustDocResearcher = require("../res/rustdoc/rustdoc_researcher")

        const keywords = args.join(" ")
        const results = rustDocResearcher(keywords)
        
        let counter = 0
        let contentNames = ""
        let contentIsArgs = ""
        let contentReturned = ""

        for (let result of results.others) {
            if (counter >= 5) break
            contentNames += "- ["
            if (result.path !== "") {
                contentNames += result.path + "::"
            }
            contentNames += "**" + result.name + "**](" + result.href + ")"
            if (result.desc !== "") {
                contentNames += " : " + result.desc
            }
            contentNames += "\n"
            counter++
        }

        counter = 0
        for (let result of results.in_args) {
            if (counter >= 5) break
            contentIsArgs += "- ["
            if (result.path !== "") {
                contentIsArgs += result.path + "::"
            }
            contentIsArgs += "**" + result.name + "**](" + result.href + ")"
            if (result.desc !== "") {
                contentIsArgs += " : " + result.desc
            }
            contentIsArgs += "\n"
            counter++
        }

        counter = 0
        for (let result of results.returned) {
            if (counter >= 5) break
            contentReturned += "- ["
            if (result.path !== "") {
                contentReturned += result.path + "::"
            }
            contentReturned += "**" + result.name + "**](" + result.href + ")"
            if (result.desc !== "") {
                contentReturned += " : " + result.desc
            }
            contentReturned += "\n"
            counter++
        }

        let embed = new Discord.MessageEmbed()
            .setTitle(__("results"))
			.setColor('#353535')
			.setThumbnail("https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Rust_programming_language_black_logo.svg/1024px-Rust_programming_language_black_logo.svg.png")
            .setFooter(__("request_from") + msg.author.username, msg.author.displayAvatarURL())

        if (contentNames !== "") {
            embed.addField(__("in_name"), contentNames)
        }

        if (contentIsArgs !== "") {
            embed.addField(__("in_settings"), contentIsArgs)
        }

        if (contentReturned !== "") {
            embed.addField(__("in_return_types"), contentReturned)
        }

        if (contentNames === "" && contentIsArgs === "" && contentReturned === "") {
            embed.addField(__("no_result_title"), __("no_result"))
        }
        
        msg.channel.send(embed)
    }
}