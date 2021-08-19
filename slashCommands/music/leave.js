const { SlashCommandBuilder } = require("@discordjs/builders")
const { getVoiceConnection } = require("@discordjs/voice")
const musicAuth = require("../../lib/music/music_control_auth")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("leave")
        .setDescription(__("description_leave")),
    guildOnly: true,

    async execute(bot, interaction) {
        if (interaction.guild.me.voice.channel) {
            if (musicAuth(interaction.member, interaction.guild.me)) {
                const connection = getVoiceConnection(interaction.guild.id)
                bot.voicesQueues.get(interaction.guild.id).player.stop()
                connection.destroy()
                bot.voicesQueues.delete(interaction.guild.id)

                interaction.reply(`${__("voice_channel_left")} ${__("kirino_glad")}`)
            }
            else {
                interaction.reply({ content: `${__("not_allowed_to_control_music_because_not_in_my_voice_channel")} ${__("kirino_pout")}`, ephemeral: true })
            }
        }
        else {
            interaction.reply({ content: `${__("already_not_in_any_voice_channel")} ${__("kirino_pout")}`, ephemeral: true })
        }
    }
}