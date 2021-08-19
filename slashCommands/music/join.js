const { SlashCommandBuilder } = require("@discordjs/builders")
const { joinVoiceChannel, createAudioPlayer, AudioPlayerStatus } = require("@discordjs/voice")
const { Permissions } = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("join")
        .setDescription(__("description_join")),
    guildOnly: true,
    permissions: ["connect", "speak"],

    async execute(bot, interaction, silent) {
        if (!interaction.guild.me.voice.channel) {
            if (interaction.member.voice.channel) {
                if (interaction.guild.me.permissions.has(Permissions.FLAGS.CONNECT)) {
                    if (interaction.guild.me.permissions.has(Permissions.FLAGS.SPEAK)) {
                        const connection = joinVoiceChannel({
                            channelId: interaction.member.voice.channelId,
                            guildId: interaction.guild.id,
                            selfDeaf: false,
                            selfMute: false,
                            adapterCreator: interaction.guild.voiceAdapterCreator
                        })

                        const player = createAudioPlayer()
                        connection.subscribe(player)

                        bot.voicesQueues.set(interaction.guild.id, {
                            player,
                            songs: []
                        })

                        player.on(AudioPlayerStatus.Idle, () => {
                            const currentQueue = bot.voicesQueues.get(interaction.guild.id)
                            currentQueue.songs.shift()
                            if (currentQueue.songs.length > 0) play(interaction.channel, currentQueue)
                            else {
                                interaction.channel.send(`${__("queue_end_reached")} ${__("kirino_glad")}`)
                            }
                        })

                        if (!silent) interaction.reply(`${__("voice_channel_joined")} ${__("kirino_glad")}`)
                    }
                    else if (!silent) {
                        interaction.reply({ content: `${__("missing_perm_connect")} ${__("kirino_pout")}`, ephemeral: true })
                    }
                }
                else if (!silent) {
                    interaction.reply({ content: `${__("missing_perm_speak")} ${__("kirino_pout")}`, ephemeral: true })
                }
            }
            else if (!silent) {
                interaction.reply({ content: `${__("you_are_not_in_any_voice_channel")} ${__("kirino_pff")}`, ephemeral: true })
            }
        }
        else if (!silent) {
            interaction.reply({ content: `${__("already_in_a_voice_channel")} ${__("kirino_pout")}`, ephemeral: true })
        }
    }
}