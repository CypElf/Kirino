import { Events, Locale } from "discord.js"
import i18next from "i18next"
import { Kirino } from "../lib/misc/types"
import { what } from "../lib/misc/format"
import { t } from "../lib/misc/i18n"

export function eventHandler(bot: Kirino) {
    bot.on(Events.InteractionCreate, async interaction => {
        if (interaction.isChatInputCommand() && !interaction.user.bot) {
            const { commandName } = interaction
            const command = bot.commands.get(commandName)
            if (command === undefined) return

            const lang = interaction.locale === Locale.French ? "fr" : "en"
            await i18next.changeLanguage(lang)
            await i18next.loadNamespaces(commandName)
            i18next.setDefaultNamespace(commandName)

            console.log(`Executing command ${command.name} for ${interaction.user.tag} (from server ${interaction.guild ? interaction.guild.name : "DM"})`)

            try {
                await command.execute(bot, interaction)
            }
            catch (err) {
                if (err instanceof Error) {
                    console.error(err.stack)
                }
                else {
                    console.error(err)
                }
                interaction.reply({ content: what(t("interactionCreate:command_runtime_error")), ephemeral: true })
            }
        }
    })
}