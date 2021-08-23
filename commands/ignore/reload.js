module.exports = {
    name: "reload",
    guildOnly: false,
    args: true,

    async execute(bot, msg, args) {
        if (process.env.OWNER_ID === msg.author.id) {
            const commandName = args[0]
            const command = bot.commands.get(commandName) || bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))

            if (!command) return msg.channel.send(`${__("command")} \`${commandName}\` ${__("not_found")}.`)

            delete require.cache[require.resolve(`./${command.name}.js`)]
            try {
                // eslint-disable-next-line node/global-require
                const newCommand = require(`./${command.name}.js`)
                msg.client.commands.set(newCommand.name, newCommand)
                msg.channel.send(`${__("the_command")} \`${command.name}\` ${__("was_reloaded")}`)
            }
            catch (err) {
                msg.channel.send(`${__("error_while_reloading_command")} \`${command.name}\`.`)
            }

        }
    }
}