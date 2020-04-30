module.exports = {
	name: "github",
    description: "usage_github",
    guildOnly: false,
	args: true,
    usage: "usage_github",
	category: "others",
	
	async execute(bot, msg, args) {
        if (args.length > 1) {
            return msg.channel.send("Les utilisateurs de github ne peuvent pas avoir d'espaces dans leurs pseudos. Veuillez ne saisir qu'un argument. <:kirinopout:698923065773522944>")
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
                .setAuthor("Profil GitHub", "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png")
                .setColor(color)
                .setThumbnail(data.avatar_url)
                .setURL(data.html_url)
                .setFooter(`${__("request_from")}${msg.author.username}`, msg.author.displayAvatarURL())

            if (data.name) profileEmbed.setTitle(`**${data.name}** (${data.login})`)
            else profileEmbed.setTitle(`**${data.login}**`)
            if (data.blog) profileEmbed.addField("Blog", data.blog)
            if (data.company) profileEmbed.addField("Compagnie", data.company, true)
            if (data.location) profileEmbed.addField("Emplacement", data.location, true)
            if (data.email) profileEmbed.addField("E-mail", data.email)

            profileEmbed.addField("ID", data.id, true)
                .addField("Dépôts publics", `[${data.public_repos}](https://github.com/${data.login}?tab=repositories)`, true)
                .addField("Gists publics", data.public_gists, true)
                .addField("Suiveurs", `[${data.followers}](https://github.com/${data.login}?tab=followers)`, true)
                .addField("Suivis", `[${data.following}](https://github.com/${data.login}?tab=following)`, true)
                .addField("Date de création", `${creationDate} à ${creationTime}`, true)
            
            if (data.bio) profileEmbed.setDescription(data.bio)

            msg.channel.send(profileEmbed)
        }

        else {
            msg.channel.send("L'utilisateur spécifié est introuvable. <:kirinowhat:698923096752783401>")
        }
	}
}