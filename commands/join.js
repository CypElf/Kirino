module.exports = {
	name: "join",
    guildOnly: true,
    args: false,
    category: "others",

    async execute (bot, msg, args) {
        if (msg.member.voice.channel) {
            if (msg.guild.me.hasPermission("CONNECT")) {
                if (msg.guild.me.hasPermission("SPEAK")) {

                    const connection = await msg.member.voice.channel.join()
                    msg.channel.send("I joined the voice channel.")
    
                    bot.voicesQueues.set(msg.guild.id, {
                        connection: connection,
                        songs: [],
                        volume: 1
                    })
                }
                else {
                    msg.channel.send("I don't have the permission to speak in a voice channel.")
                }
            }
            else {
                msg.channel.send("I don't have the permission to join a voice channel.")
            }
        }
        else {
            msg.channel.send("You're not in any voice channel!")
        }
    }
}