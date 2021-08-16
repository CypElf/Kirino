module.exports = bot => {
    bot.on("interactionCreate", interaction => {
        if (interaction.isCommand()) {
            const { commandName } = interaction
            const command = bot.slashCommands.get(commandName)
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