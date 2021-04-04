module.exports = {
	name: "stop",
    guildOnly: true,
    args: false,
    category: "others",

    async execute (bot, msg, args) {
        const queue = bot.voicesQueues.get(msg.guild.id)

        if (!msg.guild.me.voice.channel) {
            msg.channel.send("I'm not in a voice channel!")
        }
        else if (!msg.member.voice.channel || msg.guild.me.voice.channel.id !== msg.member.voice.channel.id) {
            msg.channel.send("You're not in my voice channel, so you're not allowed to stop the queue!")
        }
        else if (queue.songs.length === 0) {
            msg.channel.send("There's nothing to stop in the queue, it's already empty.")
        }
        else {
            queue.songs = []
            queue.connection.dispatcher.end()
            msg.channel.send("Stopped.")
        }
    }
}