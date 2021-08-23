module.exports = {
    name: "dontasktoask",
    guildOnly: false,
    aliases: ["dont"],

    async execute(bot, msg) {
        msg.channel.send(`${__("dont")}\nhttps://dontasktoask.com/`)
    }
}