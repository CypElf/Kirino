module.exports = {
    name: "ping",
    guildOnly: false,
    args: false,
    cooldown: 1,

    async execute(bot, msg) {
        const start = Date.now()
        await msg.channel.send(`ping ${__("kirino_what")}`).then(async (m) => await m.edit(`pong ${__("kirino_glad")} (${Date.now() - start} ms)`))
    }
}