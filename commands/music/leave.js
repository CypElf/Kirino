const { getVoiceConnection } = require("@discordjs/voice")
const musicAuth = require("../../lib/music/music_control_auth")

module.exports = {
    name: "leave",
    guildOnly: true,
    args: false,

    async execute(bot, msg) {

        const guild = await bot.guilds.fetch(msg.guild.id)
        if (guild.me.voice.channel) {
            if (musicAuth(msg.member, guild.me)) {
                const connection = getVoiceConnection(guild.id)
                bot.voicesQueues.get(guild.id)?.player?.stop()
                connection.destroy()
                bot.voicesQueues.delete(guild.id)

                msg.channel.send(`${__("voice_channel_left")} ${__("kirino_glad")}`)
            }
            else {
                msg.channel.send(`${__("not_allowed_to_control_music_because_not_in_my_voice_channel")} ${__("kirino_pout")}`)
            }
        }
        else {
            msg.channel.send(`${__("already_not_in_any_voice_channel")} ${__("kirino_pout")}`)
        }
    }
}