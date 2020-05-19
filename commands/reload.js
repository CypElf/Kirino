module.exports = {
	name: "reload",
    guildOnly: false,
    args: true,
    category: "ignore",

    async execute (bot, msg, args) {
        if (bot.config.ownerID === msg.author.id) {
            const commandName = args[0]
            const command = bot.commands.get(commandName) || bot.commands.find(command => command.aliases && command.aliases.includes(commandName))

            if (!command) return msg.channel.send(`Command \`${commandName}\` not found.`)

            delete require.cache[require.resolve(`./${command.name}.js`)];
            try {
                const newCommand = require(`./${command.name}.js`);
                msg.client.commands.set(newCommand.name, newCommand);
                msg.channel.send(`Command \`${command.name}\` was reloaded!`);
            }
            catch (err) {
                console.log(err)
                msg.channel.send(`There was an error while reloading a command \`${command.name}\`.`);
            }
            
        }
    }
}