const { SlashCommandBuilder } = require("@discordjs/builders")
const t = require("i18next").t.bind(require("i18next"))
const musicAuth = require("../../lib/music/music_control_auth")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("stop")
        .setDescription("Stop the current song being played and clear the whole queue"),
    guildOnly: true,

    async execute(bot, interaction) {
        const queue = bot.voicesQueues.get(interaction.guild.id)

        if (musicAuth(interaction.member, interaction.guild.me)) {
            if (queue.songs.length === 0) {
                interaction.reply({ content: `${t("nothing_to_stop")} ${t("common:kirino_pout")}`, ephemeral: true })
            }
            else {
                queue.songs = []
                queue.player.stop()
                interaction.reply(`${t("stopped")} ${t("common:kirino_glad")}`)
            }
        }
        else {
            interaction.reply({ content: `${t("not_allowed_to_control_music_because_not_in_my_voice_channel")} ${t("common:kirino_pout")}`, ephemeral: true })
        }
    }
}