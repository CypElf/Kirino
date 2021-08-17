module.exports = bot => {
    bot.on("interactionCreate", interaction => {
        if (interaction.isCommand() && !interaction.user.bot) {
            const id = interaction.inGuild() ? interaction.guild.id : interaction.user.id

            let prefix = bot.db.prepare("SELECT * FROM prefixs WHERE id = ?").get(id)
            if (!prefix) prefix = ";"
            else prefix = prefix.prefix
            bot.prefix = prefix

            const { commandName } = interaction
            const command = bot.slashCommands.get(commandName)

            if (command.guildOnly && !interaction.inGuild()) {
                return interaction.reply({ content: `${__("command_not_available_in_dm")} ${__("kirino_pout")}`, ephemeral: true })
            }
            try {
                console.log(`Executing slash command ${command.name} for ${interaction.user.tag} (from ${interaction.guild ? interaction.guild.name : "DM"})`)
                command.execute(bot, interaction)
            }
            catch (err) {
                console.error(err)
                interaction.reply({ content: __("command_runtime_error"), ephemeral: true })
            }
        }
    })
}