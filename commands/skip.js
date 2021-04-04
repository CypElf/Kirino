module.exports = {
	name: "skip",
    guildOnly: true,
    args: false,
    category: "others",

    async execute (bot, msg, args) {
        const queue = bot.voicesQueues.get(msg.guild.id)

        if (!msg.guild.me.voice.channel) {
            msg.channel.send("I'm not in a voice channel!")
        }
        else if (msg.guild.me.voice.channel !== msg.member.voice.channel) {
            msg.channel.send("You're not in my voice channel, so you're not allowed to skip songs!")
        }
        else if (queue.songs.length === 0) {
            msg.channel.send("There's nothing to skip in the queue.")
        }
        else {
            queue.connection.dispatcher.end()
            msg.channel.send("Skipped.")
        }
    }
}