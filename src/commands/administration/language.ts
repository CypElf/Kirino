import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from "discord.js"
import i18next from "i18next"
import { KirinoCommand, Kirino } from "../../lib/misc/types"
import { success } from "../../lib/misc/format"
import { t } from "../../lib/misc/i18n"

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
            }))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(bot: Kirino, interaction: ChatInputCommandInteraction) {
        const isInGuild = interaction.inGuild()    
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