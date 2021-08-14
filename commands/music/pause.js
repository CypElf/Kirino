module.exports = {
    name: "pause",
    guildOnly: true,
    args: false,

    async execute(bot, msg) {
        const queue = bot.voicesQueues.get(msg.guild.id)

        const { AudioPlayerStatus } = require("@discordjs/voice")
        const musicAuth = require("../../lib/music/music_control_auth")

        if (musicAuth(msg.member, msg.guild.me)) {
            if (queue.songs.length === 0) {
                msg.channel.send(`${__("nothing_playing")} ${__("kirino_pout")}`)
            }
            else if (queue.player.state.status === AudioPlayerStatus.Paused) {
                msg.channel.send(`${__("already_paused")} ${__("kirino_pout")}`)
            }
            else {
                queue.player.pause()
                msg.channel.send(`${__("successfully_paused")} ${__("kirino_glad")}`)
            }
        }
        else {
            msg.channel.send(`${__("not_allowed_to_control_music_because_not_in_my_voice_channel")} ${__("kirino_pout")}`)
        }
    }
}