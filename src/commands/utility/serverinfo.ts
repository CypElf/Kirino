import { SlashCommandBuilder, time } from "@discordjs/builders"
import { ChannelType, ChatInputCommandInteraction, GuildMember, EmbedBuilder, GuildPremiumTier } from "discord.js"
import i18next from "i18next"
import { KirinoCommand, Kirino } from "../../lib/misc/types"

const t = i18next.t.bind(i18next)

export const command: KirinoCommand = {
    builder: new SlashCommandBuilder()
        .setName("serverinfo")
        .setDescription("Give you informations about this server"),
    guildOnly: true,

    async execute(bot: Kirino, interaction: ChatInputCommandInteraction) {
        if (!interaction.guild) return

        const members = await interaction.guild.members.fetch() ?? []
        const bots = [...members.values()].filter((member: GuildMember) => member.user.bot).length
        const humans = interaction.guild.memberCount - bots
        const roles = interaction.guild.roles.cache.filter(role => role.name !== "@everyone")
        const displayedRoles = `<@&${roles.map(role => role.id).join(">, <@&")}>`
        const rolesCount = roles.size
        const displayedRolesCount = ` (${rolesCount} ${t("role", { count: rolesCount }).toLowerCase()})`

        const channels = interaction.guild.channels.cache
        const textChannelsCount = channels.filter(channel => channel.type === ChannelType.GuildText).size
        const voiceChannelsCount = channels.filter(channel => channel.type === ChannelType.GuildVoice).size
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
        const premiumTier = interaction.guild.premiumTier === GuildPremiumTier.None ? "0" : (interaction.guild.premiumTier === GuildPremiumTier.Tier1 ? "1" : (interaction.guild.premiumTier === GuildPremiumTier.Tier2 ? "2" : "3"))

        const informations = new EmbedBuilder()
            .setAuthor({ name: interaction.guild.name, iconURL: owner.user.displayAvatarURL() })
            .setColor("#000000")
            .addFields(
                { name: t("server_owner"), value: owner.user.displayName, inline: true },
                { name: t("server_id"), value: interaction.guild.id, inline: true },
                { name: t("member", { count: interaction.guild.memberCount }), value: interaction.guild.memberCount.toString(), inline: true },
                { name: t("human", { count: humans }), value: humans.toString(), inline: true },
                { name: t("bot", { count: bots }), value: bots.toString(), inline: true },
                { name: t("boost_level"), value: t("level") + " " + premiumTier, inline: true }
            )

        if (emojisCount <= 100) {
            let first = true
            emojisArray.forEach(msg1024 => {
                if (first) {
                    informations.addFields({ name: t("emojis"), value: msg1024 })
                    first = false
                }
                else {
                    informations.addFields({ name: t("emojis_continuation"), value: msg1024 })
                }
            })
        }
        else {
            informations.addFields({ name: t("emojis"), value: `${t("too_much_emojis")} (${emojisCount})` })
        }

        if (displayedRoles.length <= 1024) {
            informations.addFields({ name: t("role", { count: rolesCount }), value: `${displayedRoles} ${displayedRolesCount}` })
        }
        else {
            informations.addFields({ name: t("role", { count: rolesCount }), value: `${t("too_much_roles")} (${rolesCount})` })
        }

        informations.addFields({ name: t("channels"), value: textChannelsCount + " " + t("text_channel", { count: textChannelsCount }) + ", " + voiceChannelsCount + " " + t("vocal_channel", { count: voiceChannelsCount }), inline: true })
            .addFields({ name: t("server_creation_date"), value: `${time(interaction.guild.createdAt)} (${time(interaction.guild.createdAt, "R")})` })
            .setThumbnail(interaction.guild.iconURL() ?? "")
            .setFooter({ text: t("common:request_from", { username: interaction.user.username }), iconURL: interaction.user.displayAvatarURL() })

        interaction.reply({ embeds: [informations] })
    }
}