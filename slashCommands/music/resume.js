const { SlashCommandBuilder } = require("@discordjs/builders")
const { AudioPlayerStatus } = require("@discordjs/voice")
const t = require("i18next").t.bind(require("i18next"))
const musicAuth = require("../../lib/music/music_control_auth")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("resume")
        .setDescription("Resume the currently paused music"),
    guildOnly: true,

    async execute(bot, interaction) {
        const queue = bot.voicesQueues.get(interaction.guild.id)

        if (musicAuth(interaction.member, interaction.guild.me)) {
            if (queue.songs.length === 0) {
                interaction.reply({ content: `${t("nothing_playing")} ${t("common:kirino_pout")}`, ephemeral: true })
            }
            else if (queue.player.state.status !== AudioPlayerStatus.Paused) {
                interaction.reply({ content: `${t("already_playing")} ${t("common:kirino_pout")}`, ephemeral: true })
            }
            else {
                queue.player.unpause()
                interaction.reply(`${t("successfully_resumed")} ${t("common:kirino_glad")}`)
            }
        }
        else {
            interaction.reply({ content: `${t("not_allowed_to_control_music_because_not_in_my_voice_channel")} ${t("common:kirino_pout")}`, ephemeral: true })
        }
    }
}