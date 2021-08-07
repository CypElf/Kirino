module.exports = {
	name: "serverinfo",
    guildOnly: true,
    args: false,
    aliases: ["si"],
    cooldown: 3,
    
    async execute(bot, msg) {
        const { MessageEmbed } = require("discord.js")

        let creationDate = msg.guild.createdAt
        const creationMonth = String(creationDate.getMonth() + 1).padStart(2, "0")
        const creationDay = String(creationDate.getDate()).padStart(2, "0")
        const creationYear = creationDate.getFullYear()
        const creationHour = String(creationDate.getHours()).padStart(2, "0")
        const creationMinutes = String(creationDate.getMinutes()).padStart(2, "0")
        const cretionsSeconds = String(creationDate.getSeconds()).padStart(2, "0")
        creationDate = `${creationDay}/${creationMonth}/${creationYear} ${__("at")} ${creationHour}:${creationMinutes}:${cretionsSeconds}`

        const membres = msg.guild.members
        const bots = membres.cache.filter(membre => membre.user.bot).size
        const humains = msg.guild.memberCount - bots
        const roles = msg.guild.roles.cache.filter(role => role.name !== "@everyone")
        let displayedRoles = `<@&${roles.map(role => role.id).join(">, <@&")}>`
        let rolesCount = roles.size
        let displayedRolesCount = ` (${rolesCount} ${__n("roles", rolesCount).toLowerCase()})`

        const salons = msg.guild.channels.cache
        const nbSalonsTxt = salons.filter(salon => salon.type == "text").size
        const nbSalonsVocaux = salons.filter(salon => salon.type == "voice").size
        let emojis = msg.guild.emojis.cache.array()
        const emojisCount = emojis.length

        let emojisArray = [""]
        let displayedEmojisCount = ""
        if (emojisCount === 0) displayedEmojisCount = __("nothing")

        displayedEmojisCount += ` (${emojisCount} ${__n("emoji", emojisCount)})`

        let i = 0
        emojis.forEach(emoji => {
            if (emojisArray[i].length + emoji.toString().length + 3 > 1024) {
                i++
                emojisArray.push(emoji.toString())
            }
            else {
                emojisArray[i] += emoji.toString()
            }
        })

        if (emojisArray[i].length + displayedEmojisCount.length > 1024) {
            emojisArray.push(displayedEmojisCount.toString())
        }
        else {
            emojisArray[i] += displayedEmojisCount.toString()
        }

        const owner = await msg.guild.members.fetch(msg.guild.ownerID)

        const informations = new MessageEmbed()
            .setAuthor(msg.guild.name, owner.user.displayAvatarURL())
            .setColor("#000000")
            .addField(__("server_owner"), owner.user.tag, true)
            .addField(__("server_id"), msg.guild.id, true)
            .addField(__n("members", msg.guild.memberCount), msg.guild.memberCount, true)
            .addField(__n("humans", humains), humains, true)
            .addField(__n("bots", bots), bots, true)
            .addField(__("boost_level"), __("level") + " " + msg.guild.premiumTier, true)
            .addField(__("region"), msg.guild.region, true)

        if (emojisCount <= 100) {
            let first = true
            emojisArray.forEach(msg1024 => {
                if (first) {
                    informations.addField(__("emojis"), msg1024)
                    first = false
                }
                else {
                    informations.addField(__("emojis_continuation"), msg1024)
                }
            })
        }
        else {
            informations.addField(__("emojis"), `${__("too_much_emojis")} (${emojisCount})`)
        }

        if (displayedRoles.length <= 1024) {
            informations.addField(__n("roles", rolesCount), `${displayedRoles} ${displayedRolesCount}`)
        }
        else {
            informations.addField(__n("roles", rolesCount), `${__("too_much_roles")} (${rolesCount})`)
        }
        
        informations.addField(__("channels"), nbSalonsTxt + " " + __n("text_channel", nbSalonsTxt) + ", " + nbSalonsVocaux + " " + __n("vocal_channel", nbSalonsVocaux), true)
        .addField(__("server_creation_date"), creationDate, true)
        .setThumbnail(msg.guild.iconURL({ dynamic: true }))
        .setFooter(__("request_from") + msg.author.username, msg.author.displayAvatarURL())
        msg.channel.send({ embeds: [informations] })
    }
}