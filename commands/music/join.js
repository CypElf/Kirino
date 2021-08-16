module.exports = {
    name: "join",
    guildOnly: true,
    args: false,
    permissions: ["connect", "speak"],

    async execute(bot, msg) {
        const { Permissions } = require("discord.js")
        const { joinVoiceChannel, createAudioPlayer, AudioPlayerStatus } = require("@discordjs/voice")

        if (!msg.guild.me.voice.channel) {
            if (msg.member.voice.channel) {
                if (msg.guild.me.permissions.has(Permissions.FLAGS.CONNECT)) {
                    if (msg.guild.me.permissions.has(Permissions.FLAGS.SPEAK)) {
                        const connection = joinVoiceChannel({
                            channelId: msg.member.voice.channelId,
                            guildId: msg.guild.id,
                            selfDeaf: false,
                            selfMute: false,
                            adapterCreator: msg.guild.voiceAdapterCreator
                        })

                        const player = createAudioPlayer()
                        connection.subscribe(player)

                        bot.voicesQueues.set(msg.guild.id, {
                            player,
                            songs: []
                        })

                        player.on(AudioPlayerStatus.Idle, () => {
                            const currentQueue = bot.voicesQueues.get(msg.guild.id)
                            currentQueue.songs.shift()
                            if (currentQueue.songs.length > 0) play(msg.channel, currentQueue)
                            else {
                                msg.channel.send(`${__("queue_end_reached")} ${__("kirino_glad")}`)
                            }
                        })

                        msg.channel.send(`${__("voice_channel_joined")} ${__("kirino_glad")}`)
                    }
                    else {
                        msg.channel.send(`${__("missing_perm_connect")} ${__("kirino_pout")}`)
                    }
                }
                else {
                    msg.channel.send(`${__("missing_perm_speak")} ${__("kirino_pout")}`)
                }
            }
            else {
                msg.channel.send(`${__("you_are_not_in_any_voice_channel")} ${__("kirino_pff")}`)
            }
        }
        else {
            msg.channel.send(`${__("already_in_a_voice_channel")} ${__("kirino_pout")}`)
        }
    }
}