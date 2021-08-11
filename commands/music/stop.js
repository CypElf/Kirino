module.exports = {
    name: "stop",
    guildOnly: true,
    args: false,

    async execute(bot, msg) {
        const queue = bot.voicesQueues.get(msg.guild.id)

        const musicAuth = require("../../lib/music/music_control_auth")

        if (musicAuth(msg.channel, msg.member, msg.guild.me)) {
            if (queue.songs.length === 0) {
                msg.channel.send(`${__("nothing_to_stop")} ${__("kirino_pout")}`)
            }
            else {
                queue.songs = []
                queue.connection.dispatcher.end()
                msg.channel.send(`${__("stopped")} ${__("kirino_glad")}`)
            }
        }
    }
}