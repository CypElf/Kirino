module.exports = {
	name: "resume",
    guildOnly: true,
    args: false,
    category: "music",

    async execute (bot, msg) {
        const queue = bot.voicesQueues.get(msg.guild.id)

        const musicAuth = require("../lib/music/music_control_auth")

        if (musicAuth(msg.channel, msg.member, msg.guild.me)) {
            if (queue.songs.length === 0) {
                msg.channel.send(`${__("nothing_playing")} ${__("kirino_pout")}`)
            }
            else if (!queue.connection.dispatcher.paused) {
                msg.channel.send(`${__("already_playing")} ${__("kirino_pout")}`)
            }
            else {
                queue.connection.dispatcher.resume()
                msg.channel.send(`${__("successfully_resumed")} ${__("kirino_glad")}`)
            }
        }
    }
}