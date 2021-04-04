module.exports = {
	name: "pause",
    guildOnly: true,
    args: false,
    category: "others",

    async execute (bot, msg, args) {
        const queue = bot.voicesQueues.get(msg.guild.id)

        if (!msg.guild.me.voice.channel) {
            msg.channel.send("I'm not in a voice channel!")
        }
        else if (msg.guild.me.voice.channel !== msg.member.voice.channel) {
            msg.channel.send("You're not in my voice channel, you're not allowed to pause the queue!")
        }
        else if (queue.songs.length === 0) {
            msg.channel.send("There's nothing to pause in the queue.")
        }
        else if (queue.connection.dispatcher.paused) {
            msg.channel.send("The music is already paused.")
        }
        else {
            queue.connection.dispatcher.pause()
            msg.channel.send("Paused.")
        }
    }
}