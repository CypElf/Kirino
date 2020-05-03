module.exports = {
	name: "userinfo",
    description: "description_userinfo",
    guildOnly: true,
    args: false,
    usage: "usage_userinfo",
    aliases: ["ui"],
    category: "others",
    
    async execute(bot, msg, argsArray) {
        let member

        // si aucun argument n'est fourni, l'utilisateur dont les informations seront affichées sera celui ayant exécuté la commande
        if (!argsArray.length) {
            member = msg.member
        }

        // sinon, on regardera les arguments, et...
        else {
            // ... si un utilisateur est mentionné, ce sera lui dont les informations seront affichées...
            member = msg.mentions.members.first()
            if(!member) { // ... sinon, on cherchera un utilisateur dont le pseudo correspond à l'argument saisi pour afficher ses informations...
                let user = ""
                argsArray.forEach(element => {
                    user += element + " "
                })
                user = user.substring(0, user.length - 1)
                member = msg.guild.members.cache.array().find((currentUser) => {
                    return currentUser.user.username.toLowerCase() === user.toLowerCase()
                })
                if (member === undefined) { // ... et enfin si on a toujours rien, on répond qu'il n'y a pas d'utilisateur correspondant
                    return msg.channel.send(__("please_correctly_write_or_mention_a_member") + " <:kirinopout:698923065773522944>")
                }
            }
        }

        const Discord = require('discord.js')
        
        let creationDate = member.user.createdAt
        const creationMonth = String(creationDate.getMonth() + 1).padStart(2, "0")
        const creationDay = String(creationDate.getDate()).padStart(2, "0")
        const creationYear = creationDate.getFullYear()
        const creationHour = String(creationDate.getHours()).padStart(2, "0")
        const creationMinutes = String(creationDate.getMinutes()).padStart(2, "0")
        const cretionsSeconds = String(creationDate.getSeconds()).padStart(2, "0")
        creationDate = `${creationDay}/${creationMonth}/${creationYear} ${__("at")} ${creationHour}:${creationMinutes}:${cretionsSeconds}`


        let joinedAt = member.joinedAt
        const joinedAtMonth = String(joinedAt.getMonth() + 1).padStart(2, "0")
        const joinedAtDay = String(joinedAt.getDate()).padStart(2, "0")
        const joinedAtYear = joinedAt.getFullYear()
        const joinedAtHour = String(joinedAt.getHours()).padStart(2, "0")
        const joinedAtMinutes = String(joinedAt.getMinutes()).padStart(2, "0")
        const joinedAtSeconds = String(joinedAt.getSeconds()).padStart(2, "0")
        joinedAt = `${joinedAtDay}/${joinedAtMonth}/${joinedAtYear} ${__("at")} ${joinedAtHour}:${joinedAtMinutes}:${joinedAtSeconds}`

        let perms = ""

        for (let flag in Discord.Permissions.FLAGS) {
            if (member.hasPermission(flag)) {
                perms += "`" + flag.toLowerCase().replace(/_/g, " ") + "`, "
            }
        }
        perms = perms.substring(0, perms.length - 2)
        
        const arrayTotalRoles = member.roles.cache
        let arrayRoles = []
        let nbRoles = 0
        arrayTotalRoles.forEach((role) => {
            if (role.name !== "@everyone") {
                arrayRoles.push(role.name)
                nbRoles++
            }
        })
        let roles = arrayRoles.join(", ") + " (" + nbRoles + " " + __n("roles", nbRoles).toLowerCase() + ")"

        let nickname = member.nickname
        if (nickname === undefined || nickname === null) {
            nickname = __("nothing")
        }
        let presence
        try {
            presence = member.presence.game.name
        }
        catch(err) {
            presence = __("nothing")
        }
        let premiumSince = member.premiumSince
        if (premiumSince) {
            const premiumSinceMonth = String(premiumSince.getMonth() + 1).padStart(2, "0")
            const premiumSinceDay = String(premiumSince.getDate()).padStart(2, "0")
            const premiumSinceYear = premiumSince.getFullYear()
            const premiumSinceHour = String(premiumSince.getHours()).padStart(2, "0")
            const premiumSinceMinutes = String(premiumSince.getMinutes()).padStart(2, "0")
            const premiumSinceSeconds = String(premiumSince.getSeconds()).padStart(2, "0")
            premiumSince = __("yes_since") + ` ${premiumSinceDay}/${premiumSinceMonth}/${premiumSinceYear} ${__("at")} ${premiumSinceHour}:${premiumSinceMinutes}:${premiumSinceSeconds}`
        }
        else {
            premiumSince = __("no_capitalized")
        }

        let informations = new Discord.MessageEmbed()
        .setAuthor(member.user.tag, member.user.displayAvatarURL())
        .setColor("#000000")
        .addField(__("id"), member.user.id, true)
        .addField(__("game"), presence, true)
        .addField(__("nickname"), nickname, true)
        .addField(__("join_date"), joinedAt, true)
        .addField(__("user_creation_date"), creationDate, true)
        .addField(__("booster"), premiumSince)
        .addField(__n("roles", nbRoles), roles, true)
        .addField(__("permissions"), perms)
        .setThumbnail(member.user.displayAvatarURL())
        .setFooter(__("request_from") + msg.author.username, msg.author.displayAvatarURL())
        msg.channel.send(informations)
    }
}