module.exports = {
	name: "queue",
    guildOnly: true,
    args: false,
    category: "others",

    async execute (bot, msg, args) {
        const queue = bot.voicesQueues.get(msg.guild.id)

        if (!msg.guild.me.voice.channel) {
            msg.channel.send("I'm not in a voice channel!")
        }
        else if (queue.songs.length === 0) {
            msg.channel.send("The queue is empty.")
        }
        else {
            const toChunks = require("../lib/string/to_chunks")
            const text = "The songs in the queue are:\n- " + queue.songs.map(song => song.title).join("\n- ")

            const textArray = toChunks(text, 2000)
            for (const chunk of textArray) {
                msg.channel.send(chunk)
            }
        }
    }
}

