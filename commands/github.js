module.exports = {
	name: "github",
    description: "description_github",
    guildOnly: false,
	args: true,
    usage: "usage_github",
	category: "others",
	
	async execute(bot, msg, args) {
        if (args.length > 1) {
            return msg.channel.send(`${__("too_much_args_for_github")} <:kirinopout:698923065773522944>`)
        }
        const fetch = require("node-fetch")

        const userToFetch = args[0]
        const api_call = await fetch(`https://api.github.com/users/${userToFetch}`)
        const data = await api_call.json()

        if (!data.message) {
            const Discord = require("discord.js")
            const ColorThief = require("colorthief")
            
            let createdAt = data.created_at
            // github give us date as `YYYY-MM-DDTHH:MM:SSZ` with T and Z hardcoded
            const creationDate = createdAt.split("T")[0].split("-").reverse().join("/")
            const creationTime = createdAt.split("T")[1].split("Z")[0]

            const color = await ColorThief.getColor(data.avatar_url)

            const profileEmbed = new Discord.MessageEmbed()
                .setAuthor(__("github_profile"), "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png")
                .setColor(color)
                .setThumbnail(data.avatar_url)
                .setURL(data.html_url)
                .setFooter(`${__("request_from")}${msg.author.username}`, msg.author.displayAvatarURL())

            if (data.name) profileEmbed.setTitle(`**${data.name}** (${data.login})`)
            else profileEmbed.setTitle(`**${data.login}**`)
            if (data.blog) profileEmbed.addField(__("blog"), data.blog)
            if (data.company) profileEmbed.addField(__("company"), data.company, true)
            if (data.location) profileEmbed.addField(__("location"), data.location, true)
            if (data.email) profileEmbed.addField(__("email"), data.email)

            profileEmbed.addField(__("id"), data.id, true)
                .addField(__("public_repos"), `[${data.public_repos}](https://github.com/${data.login}?tab=repositories)`, true)
                .addField(__("public_gists"), data.public_gists, true)
                .addField(__("followers"), `[${data.followers}](https://github.com/${data.login}?tab=followers)`, true)
                .addField("following", `[${data.following}](https://github.com/${data.login}?tab=following)`, true)
                .addField(__("account_creation_date"), `${creationDate} à ${creationTime}`, true)
            
            if (data.bio) profileEmbed.setDescription(data.bio)

            msg.channel.send(profileEmbed)
        }

        else {
            msg.channel.send(`${__("user_not_found")} <:kirinowhat:698923096752783401>`)
        }
	}
}