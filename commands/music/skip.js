const musicAuth = require("../../lib/music/music_control_auth")

module.exports = {
    name: "skip",
    guildOnly: true,
    args: false,

    async execute(bot, msg) {
        const queue = bot.voicesQueues.get(msg.guild.id)

        if (musicAuth(msg.member, msg.guild.me)) {
            if (queue.songs.length === 0) {
                msg.channel.send(`${__("nothing_to_skip")} ${__("kirino_pout")}`)
            }
            else {
                queue.player.stop()
                msg.channel.send(`${__("skipped")} ${__("kirino_glad")}`)
            }
        }
        else {
            msg.channel.send(`${__("not_allowed_to_control_music_because_not_in_my_voice_channel")} ${__("kirino_pout")}`)
        }
    }
}