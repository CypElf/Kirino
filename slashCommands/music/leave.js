const { SlashCommandBuilder } = require("@discordjs/builders")
const { getVoiceConnection } = require("@discordjs/voice")
const t = require("i18next").t.bind(require("i18next"))
const musicAuth = require("../../lib/music/music_control_auth")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("leave")
        .setDescription("Make me leave my current voice channel"),
    guildOnly: true,

    async execute(bot, interaction) {
        if (interaction.guild.me.voice.channel) {
            if (musicAuth(interaction.member, interaction.guild.me)) {
                const connection = getVoiceConnection(interaction.guild.id)
                bot.voicesQueues.get(interaction.guild.id).player.stop()
                connection.destroy()
                bot.voicesQueues.delete(interaction.guild.id)

                interaction.reply(`${t("voice_channel_left")} ${t("common:kirino_glad")}`)
            }
            else {
                interaction.reply({ content: `${t("not_allowed_to_control_music_because_not_in_my_voice_channel")} ${t("common:kirino_pout")}`, ephemeral: true })
            }
        }
        else {
            interaction.reply({ content: `${t("already_not_in_any_voice_channel")} ${t("common:kirino_pout")}`, ephemeral: true })
        }
    }
}