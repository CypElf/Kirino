import { SlashCommandBuilder } from "@discordjs/builders"
import { CommandInteraction, GuildMember, Permissions } from "discord.js"
import i18next from "i18next"
import { Kirino } from "../../lib/misc/types"

const t = i18next.t.bind(i18next)

export default {
    data: new SlashCommandBuilder()
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
    cooldown: 3,
    permissions: ["manage guild"],

    async execute(bot: Kirino, interaction: CommandInteraction) {
        const isInGuild = interaction.inGuild()
        const member = interaction.member as GuildMember | null

        if (isInGuild) {
            if (member && !member.permissions.has(Permissions.FLAGS.MANAGE_GUILD)) {
                return interaction.reply({ content: `${t("not_enough_permission_to_change_language")} ${t("common:kirino_pout")}`, ephemeral: true })
            }
        }

        const language = interaction.options.getString("language") as string

        const id = isInGuild ? interaction.guild?.id : interaction.user.id
        bot.db.prepare("INSERT INTO languages(id, language) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET language = excluded.language").run(id, language)

        await i18next.changeLanguage(language)

        if (isInGuild) {
            interaction.reply(`${t("server_language_changed") + language}\` ${t("common:kirino_glad")} !`)
        }
        else {
            interaction.reply(`${t("dm_language_changed") + language}\` ${t("common:kirino_glad")} !`)
        }
    }
}