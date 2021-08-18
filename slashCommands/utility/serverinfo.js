const { SlashCommandBuilder, time } = require("@discordjs/builders")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("serverinfo")
        .setDescription(__("description_serverinfo")),
    guildOnly: true,
    cooldown: 3,

    async execute(bot, interaction) {
        const { MessageEmbed } = require("discord.js")

        const members = await interaction.guild.members.fetch()
        const bots = members.filter(membre => membre.user.bot).size
        const humans = interaction.guild.memberCount - bots
        const roles = interaction.guild.roles.cache.filter(role => role.name !== "@everyone")
        const displayedRoles = `<@&${roles.map(role => role.id).join(">, <@&")}>`
        const rolesCount = roles.size
        const displayedRolesCount = ` (${rolesCount} ${__("roles").toLowerCase()})`

        const channels = interaction.guild.channels.cache
        const textChannelsCount = channels.filter(channel => channel.isText() && !channel.isThread()).size
        const voiceChannelsCount = channels.filter(channel => channel.isVoice()).size
        const emojis = [...interaction.guild.emojis.cache.values()]
        const emojisCount = emojis.length

        const emojisArray = [""]
        let displayedEmojisCount = ""
        if (emojisCount === 0) displayedEmojisCount = __("nothing")

        displayedEmojisCount += ` (${emojisCount} ${__("emoji")})`

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

        const owner = await interaction.guild.fetchOwner()
        const premiumTier = interaction.guild.premiumTier === "NONE" ? "0" : (interaction.guild.premiumTier === "TIER_1" ? "1" : (interaction.guild.premiumTier === "TIER_2" ? "2" : "3"))

        const informations = new MessageEmbed()
            .setAuthor(interaction.guild.name, owner.user.displayAvatarURL())
            .setColor("#000000")
            .addField(__("server_owner"), owner.user.tag, true)
            .addField(__("server_id"), interaction.guild.id, true)
            .addField(__("members"), interaction.guild.memberCount.toString(), true)
            .addField(__("humans"), humans.toString(), true)
            .addField(__("bots"), bots.toString(), true)
            .addField(__("boost_level"), __("level") + " " + premiumTier, true)

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
            informations.addField(__("roles"), `${displayedRoles} ${displayedRolesCount}`)
        }
        else {
            informations.addField(__("roles"), `${__("too_much_roles")} (${rolesCount})`)
        }

        informations.addField(__("channels"), textChannelsCount + " " + __("text_channel") + ", " + voiceChannelsCount + " " + __("vocal_channel"), true)
            .addField(__("server_creation_date"), `${time(interaction.guild.createdAt)} (${time(interaction.guild.createdAt, "R")})`)
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .setFooter(__("request_from") + interaction.user.username, interaction.user.displayAvatarURL())
        
        interaction.reply({ embeds: [informations] })
    }
}