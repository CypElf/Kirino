const { SlashCommandBuilder, time } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")
const t = require("i18next").t.bind(require("i18next"))

module.exports = {
    data: new SlashCommandBuilder()
        .setName("serverinfo")
        .setDescription("Give you informations about this server"),
    guildOnly: true,
    cooldown: 3,

    async execute(bot, interaction) {
        const members = await interaction.guild.members.fetch()
        const bots = members.filter(membre => membre.user.bot).size
        const humans = interaction.guild.memberCount - bots
        const roles = interaction.guild.roles.cache.filter(role => role.name !== "@everyone")
        const displayedRoles = `<@&${roles.map(role => role.id).join(">, <@&")}>`
        const rolesCount = roles.size
        const displayedRolesCount = ` (${rolesCount} ${t("role", { count: rolesCount }).toLowerCase()})`

        const channels = interaction.guild.channels.cache
        const textChannelsCount = channels.filter(channel => channel.isText() && !channel.isThread()).size
        const voiceChannelsCount = channels.filter(channel => channel.isVoice()).size
        const emojis = [...interaction.guild.emojis.cache.values()]
        const emojisCount = emojis.length

        const emojisArray = [""]
        let displayedEmojisCount = ""
        if (emojisCount === 0) displayedEmojisCount = t("nothing")

        displayedEmojisCount += ` (${emojisCount} ${t("emoji", { count: emojisCount })})`

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
            .setAuthor({ name: interaction.guild.name, iconURL: owner.user.displayAvatarURL() })
            .setColor("#000000")
            .addField(t("server_owner"), owner.user.tag, true)
            .addField(t("server_id"), interaction.guild.id, true)
            .addField(t("member", { count: interaction.guild.memberCount }), interaction.guild.memberCount.toString(), true)
            .addField(t("human", { count: humans }), humans.toString(), true)
            .addField(t("bot", { count: bots }), bots.toString(), true)
            .addField(t("boost_level"), t("level") + " " + premiumTier, true)

        if (emojisCount <= 100) {
            let first = true
            emojisArray.forEach(msg1024 => {
                if (first) {
                    informations.addField(t("emojis"), msg1024)
                    first = false
                }
                else {
                    informations.addField(t("emojis_continuation"), msg1024)
                }
            })
        }
        else {
            informations.addField(t("emojis"), `${t("too_much_emojis")} (${emojisCount})`)
        }

        if (displayedRoles.length <= 1024) {
            informations.addField(t("role", { count: rolesCount }), `${displayedRoles} ${displayedRolesCount}`)
        }
        else {
            informations.addField(t("role", { count: rolesCount }), `${t("too_much_roles")} (${rolesCount})`)
        }

        informations.addField(t("channels"), textChannelsCount + " " + t("text_channel", { count: textChannelsCount }) + ", " + voiceChannelsCount + " " + t("vocal_channel", { count: voiceChannelsCount }), true)
            .addField(t("server_creation_date"), `${time(interaction.guild.createdAt)} (${time(interaction.guild.createdAt, "R")})`)
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .setFooter({ text: t("common:request_from", { username: interaction.user.username }), iconURL: interaction.user.displayAvatarURL() })

        interaction.reply({ embeds: [informations] })
    }
}