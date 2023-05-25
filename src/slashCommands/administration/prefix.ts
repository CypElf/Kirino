import { SlashCommandBuilder } from "@discordjs/builders"
import { CommandInteraction, GuildMember, Permissions } from "discord.js"
import i18next from "i18next"
import { Kirino } from "../../lib/misc/types"

const t = i18next.t.bind(i18next)

export default {
    data: new SlashCommandBuilder()
        .setName("prefix")
        .setDescription("Change my prefix on the server / DM")
        .addStringOption(option => option.setName("prefix").setDescription("The new prefix you want to set").setRequired(true)),
    guildOnly: false,
    cooldown: 5,
    permissions: ["manage guild"],

    async execute(bot: Kirino, interaction: CommandInteraction) {
        const member = interaction.member as GuildMember | null

        if (interaction.guild && member && !member.permissions.has(Permissions.FLAGS.MANAGE_GUILD)) return interaction.reply({ content: t("missing_permissions_to_execute_this_command"), ephemeral: true })

        const newPrefix = interaction.options.getString("prefix") as string

        if (newPrefix.includes(" ")) return interaction.reply({ content: t("no_spaces_in_prefixs"), ephemeral: true })
        if (newPrefix.length > 3) return interaction.reply({ content: t("three_chars_max"), ephemeral: true })

        const id = interaction.inGuild() && interaction.guild ? interaction.guild.id : interaction.user.id

        if (newPrefix === ";") bot.db.prepare("DELETE FROM prefixs WHERE id = ?").run(id)
        else bot.db.prepare("INSERT INTO prefixs(id, prefix) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET prefix = excluded.prefix").run(id, newPrefix)

        interaction.reply(`${t("new_prefix_is_now")} \`${newPrefix}\` ${t("common:kirino_glad")} !`)
    }
}