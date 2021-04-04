module.exports = {
	name: "resume",
    guildOnly: true,
    args: false,
    category: "others",

    async execute (bot, msg, args) {
        const queue = bot.voicesQueues.get(msg.guild.id)

        if (!msg.guild.me.voice.channel) {
            msg.channel.send("I'm not in a voice channel!")
        }
        else if (!msg.member.voice.channel || msg.guild.me.voice.channel.id !== msg.member.voice.channel.id) {
            msg.channel.send("You're not in my voice channel, you're not allowed to resume the queue!")
        }
        else if (queue.songs.length === 0) {
            msg.channel.send("There's nothing to resume.")
        }
        else if (!queue.connection.dispatcher.paused) {
            msg.channel.send("The music is already not paused.")
        }
        else {
            queue.connection.dispatcher.resume()
            msg.channel.send("Resumed.")
        }
    }
}