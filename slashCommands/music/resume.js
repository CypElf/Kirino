const { SlashCommandBuilder } = require("@discordjs/builders")
const { AudioPlayerStatus } = require("@discordjs/voice")
const musicAuth = require("../../lib/music/music_control_auth")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("resume")
        .setDescription(__("description_resume")),
    guildOnly: true,

    async execute(bot, interaction) {
        const queue = bot.voicesQueues.get(interaction.guild.id)

        if (musicAuth(interaction.member, interaction.guild.me)) {
            if (queue.songs.length === 0) {
                interaction.reply({ content: `${__("nothing_playing")} ${__("kirino_pout")}`, ephemeral: true })
            }
            else if (queue.player.state.status !== AudioPlayerStatus.Paused) {
                interaction.reply({ content: `${__("already_playing")} ${__("kirino_pout")}`, ephemeral: true })
            }
            else {
                queue.player.unpause()
                interaction.reply(`${__("successfully_resumed")} ${__("kirino_glad")}`)
            }
        }
        else {
            interaction.reply({ content: `${__("not_allowed_to_control_music_because_not_in_my_voice_channel")} ${__("kirino_pout")}`, ephemeral: true })
        }
    }
}