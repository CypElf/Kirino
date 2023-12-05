import { SlashCommandBuilder } from "@discordjs/builders"
import { ChatInputCommandInteraction, GuildMember, PermissionFlagsBits } from "discord.js"
import i18next from "i18next"
import { KirinoCommand, Kirino } from "../../lib/misc/types"
import { success, denied } from "../../lib/misc/format"

const t = i18next.t.bind(i18next)

export const command: KirinoCommand = {
    builder: new SlashCommandBuilder()
        .setName("language")
        .setDescription("Allow you to change the language I use for all my commands")
        .addStringOption(option => option.setName("language")
            .setDescription("The new language you want to set")
            .setRequired(true)
            .addChoices({
                name: "English",
                value: "en"
            }, {
                name: "Français",
                value: "fr"
            })),
    guildOnly: false,
    permissions: ["manage guild"],

    async execute(bot: Kirino, interaction: ChatInputCommandInteraction) {
        const isInGuild = interaction.inGuild()
        const member = interaction.member as GuildMember | null

        if (isInGuild) {
            if (member && !member.permissions.has(PermissionFlagsBits.ManageGuild)) {
                return interaction.reply({ content: denied(t("not_enough_permission_to_change_language")), ephemeral: true })
            }
        }

        const language = interaction.options.getString("language") as string

        const id = isInGuild ? interaction.guild?.id : interaction.user.id
        bot.db.prepare("INSERT INTO languages(id, language) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET language = excluded.language").run(id, language)

        await i18next.changeLanguage(language)

        if (isInGuild) {
            interaction.reply(success(t("server_language_changed") + language + "`"))
        }
        else {
            interaction.reply(success(t("dm_language_changed") + language + "`"))
        }
    }
}