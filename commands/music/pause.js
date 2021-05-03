module.exports = {
	name: "pause",
    guildOnly: true,
    args: false,

    async execute (bot, msg) {
        const queue = bot.voicesQueues.get(msg.guild.id)

        const musicAuth = require("../../lib/music/music_control_auth")

        if (musicAuth(msg.channel, msg.member, msg.guild.me)) {
            if (queue.songs.length === 0) {
                msg.channel.send(`${__("nothing_playing")} ${__("kirino_pout")}`)
            }
            else if (queue.connection.dispatcher.paused) {
                msg.channel.send(`${__("already_paused")} ${__("kirino_pout")}`)
            }
            else {
                queue.connection.dispatcher.pause()
                msg.channel.send(`${__("successfully_paused")} ${__("kirino_glad")}`)
            }
        }
    }
}