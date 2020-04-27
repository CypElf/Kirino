module.exports = {
	name: "serverinfo",
    description: "description_serverinfo",
    guildOnly: true,
    args: false,
    aliases: ["si"],
    category: "others",
    
    async execute(bot, msg) {
        const Discord = require("discord.js")

        let creationDate = msg.guild.createdAt
        const creationMonth = String(creationDate.getMonth() + 1).padStart(2, "0")
        const creationDay = String(creationDate.getDate()).padStart(2, "0")
        const creationYear = creationDate.getFullYear()
        const creationHour = String(creationDate.getHours()).padStart(2, "0")
        const creationMinutes = String(creationDate.getMinutes()).padStart(2, "0")
        const cretionsSeconds = String(creationDate.getSeconds()).padStart(2, "0")
        creationDate = `${creationDay}/${creationMonth}/${creationYear} à ${creationHour}:${creationMinutes}:${cretionsSeconds}`

        const membres = msg.guild.members
        const bots = membres.cache.filter(membre => membre.user.bot).size
        const humains = msg.guild.memberCount - bots
        const arrayTotalRoles = msg.guild.roles.cache
        let arrayRoles = []
        let nbRoles = 0
        arrayTotalRoles.forEach((role) => {
            if (role.name !== "@everyone") {
                arrayRoles.push(role.name)
                nbRoles++
            }
        })
        let roles = [""]
        let displayedRolesCount = " (" + nbRoles + " " + __n("roles", nbRoles).toLowerCase() + ")"
        let j = 0
        arrayRoles.forEach(role => {
            if (roles[j].length + role.length + 2 > 1024) {
                j++
                roles.push(role) + ", "
            }
            else {
                roles[j] += role + ", "
            }
        })

        roles[j] = roles[j].substring(0, roles[j].length - 2)

        if (roles[j].length + displayedRolesCount.length + 2 > 1024) {
            roles.push(displayedRolesCount.toString())
        }
        else {
            roles[j] += displayedRolesCount.toString()
        }

        const salons = msg.guild.channels.cache
        const nbSalonsTxt = salons.filter(salon => salon.type == "text").size
        const nbSalonsVocaux = salons.filter(salon => salon.type == "voice").size
        let emojis = msg.guild.emojis.cache.array()
        const emojisCount = emojis.length
        let emojisArray = [""]
        let displayedEmojisCount = ""
        if (emojisCount === 0) displayedEmojisCount = __("nothing")

        displayedEmojisCount += " (" + emojisCount + " " + __n("emoji", emojisCount) + ")"

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

        let informations = new Discord.MessageEmbed()
        .setAuthor(msg.guild.name, msg.guild.owner.user.displayAvatarURL())
        .setColor("#000000")
        .addField(__("server_owner"), msg.guild.owner.user.tag, true)
        .addField(__("server_id"), msg.guild.id, true)
        .addField(__n("members", msg.guild.memberCount), msg.guild.memberCount, true)
        .addField(__n("humans", humains), humains, true)
        .addField(__n("bots", bots), bots, true)
        .addField(__("boost_level"), __("level") + " " + msg.guild.premiumTier, true)
        .addField(__("region"), msg.guild.region, true)

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

        first = true
        roles.forEach(roles1024 => {
            if (first) {
                informations.addField(__n("roles", nbRoles), roles1024)
                first = false
            }
            else {
                informations.addField(__("roles_continuation"), roles1024)
            }
        })
        
        informations.addField(__("channels"), nbSalonsTxt + " " + __n("text_channel", nbSalonsTxt) + ", " + nbSalonsVocaux + " " + __n("vocal_channel", nbSalonsVocaux), true)
        .addField(__("server_creation_date"), creationDate, true)
        .setThumbnail(msg.guild.iconURL())
        .setFooter(__("request_from") + msg.author.username, msg.author.displayAvatarURL())
        msg.channel.send(informations)
    }
}