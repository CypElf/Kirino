import { Collection } from "discord.js"
import i18next from "i18next"
import { Kirino } from "../lib/misc/types"
import { what } from "../lib/misc/format"
import { Language } from "../lib/misc/database"

const t = i18next.t.bind(i18next)

export function eventHandler(bot: Kirino) {
    bot.on("interactionCreate", async interaction => {
        if (interaction.isCommand() && !interaction.user.bot) {
            const id = interaction.guild ? interaction.guild.id : interaction.user.id

            const { commandName } = interaction
            const command = bot.commands.get(commandName)

            const languageRow = bot.db.prepare("SELECT * FROM languages WHERE id = ?").get(id) as Language | undefined //?.language ?? "en"
            const lang = languageRow?.language ?? "en"
            await i18next.changeLanguage(lang)

            if (!bot.commandsCooldowns.has(command.name)) {
                bot.commandsCooldowns.set(command.name, new Collection())
            }

            const now = Date.now()
            const timestamps = bot.commandsCooldowns.get(command.name) as Collection<string, number>
            const timestamp = timestamps.get(interaction.user.id)
            const cooldown = (command.cooldown ?? 2) * 1000 // default cooldown is 2 seconds

            if (timestamp) {
                const expiration = timestamp + cooldown

                if (now < expiration) {
                    const timeLeft = (expiration - now) / 1000
                    return interaction.reply({ content: `${t("interactionCreate:please_wait", { count: Math.ceil(timeLeft), cooldown: timeLeft.toFixed(1) })} \`${command.name}\`.`, ephemeral: true })
                }
            }

            timestamps.set(interaction.user.id, now)
            setTimeout(() => timestamps.delete(interaction.user.id), cooldown)

            if (command.guildOnly && !interaction.inGuild()) {
                return interaction.reply({ content: `${t("interactionCreate:command_not_available_in_dm")} ${t("common:kirino_pout")}`, ephemeral: true })
            }

            await i18next.loadNamespaces(commandName)
            i18next.setDefaultNamespace(commandName)
            console.log(`Executing command ${command.name} for ${interaction.user.tag} (from ${interaction.guild ? interaction.guild.name : "DM"})`)

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