const i18next = require("i18next")
const t = i18next.t.bind(i18next)

module.exports = bot => {
    bot.on("interactionCreate", async interaction => {
        if (interaction.isCommand() && !interaction.user.bot) {
            const id = interaction.inGuild() ? interaction.guild.id : interaction.user.id

            let prefix = bot.db.prepare("SELECT * FROM prefixs WHERE id = ?").get(id)
            if (!prefix) prefix = ";"
            else prefix = prefix.prefix
            bot.prefix = prefix

            const { commandName } = interaction
            const command = bot.slashCommands.get(commandName)

            await i18next.loadNamespaces(commandName)
            i18next.setDefaultNamespace(commandName)

            const lang = bot.db.prepare("SELECT * FROM languages WHERE id = ?").get(id)?.language ?? "en"
            await i18next.changeLanguage(lang)

            if (command.guildOnly && !interaction.inGuild()) {
                return interaction.reply({ content: `${t("interactionCreate:command_not_available_in_dm")} ${t("common:kirino_pout")}`, ephemeral: true })
            }

            try {
                console.log(`Executing slash command ${command.name} for ${interaction.user.tag} (from ${interaction.guild ? interaction.guild.name : "DM"})`)
                await command.execute(bot, interaction)
            }
            catch (err) {
                console.error(err.stack)
                interaction.reply({ content: `${t("interactionCreate:command_runtime_error")} ${t("common:kirino_what")}`, ephemeral: true })
            }
        }
    })
}