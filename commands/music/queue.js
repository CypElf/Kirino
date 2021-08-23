const { Util } = require("discord.js")

module.exports = {
    name: "queue",
    guildOnly: true,
    args: false,

    async execute(bot, msg) {
        const queue = bot.voicesQueues.get(msg.guild.id)

        if (!msg.guild.me.voice.channel) {
            msg.channel.send(`${__("not_in_any_voice_channel")} ${__("kirino_pout")}`)
        }
        else if (queue.songs.length === 0) {
            msg.channel.send(`${__("queue_empty")} ${__("kirino_glad")}`)
        }
        else {
            const text = `${__("songs_in_queue_are")}\n- ${queue.songs.map(song => song.title).join("\n- ")}`

            for (const chunk of Util.splitMessage(text)) {
                msg.channel.send(chunk)
            }
        }
    }
}