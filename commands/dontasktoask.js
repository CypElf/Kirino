module.exports = {
	name: "dontasktoask",
    guildOnly: false,
    aliases: ["dont"],
    category: "it",

    async execute (bot, msg) {
        msg.channel.send(`${__("dont")}\nhttps://dontasktoask.com/`)
    }
}