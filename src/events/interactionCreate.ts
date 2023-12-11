import { Events } from "discord.js"
import i18next from "i18next"
import { Kirino } from "../lib/misc/types"
import { what } from "../lib/misc/format"
import { Language } from "../lib/misc/database"

const t = i18next.t.bind(i18next)

export function eventHandler(bot: Kirino) {
    bot.on(Events.InteractionCreate, async interaction => {
        if (interaction.isChatInputCommand() && !interaction.user.bot) {
            const id = interaction.guild ? interaction.guild.id : interaction.user.id

            const { commandName } = interaction
            const command = bot.commands.get(commandName)

            if (command === undefined) return

            const languageRow = bot.db.prepare("SELECT * FROM languages WHERE id = ?").get(id) as Language | undefined
            await i18next.changeLanguage(languageRow?.language ?? "en")
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