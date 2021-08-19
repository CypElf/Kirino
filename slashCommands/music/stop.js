const { SlashCommandBuilder } = require("@discordjs/builders")
const musicAuth = require("../../lib/music/music_control_auth")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("stop")
        .setDescription(__("description_stop")),
    guildOnly: true,

    async execute(bot, interaction) {
        const queue = bot.voicesQueues.get(interaction.guild.id)

        if (musicAuth(interaction.member, interaction.guild.me)) {
            if (queue.songs.length === 0) {
                interaction.reply({ content: `${__("nothing_to_stop")} ${__("kirino_pout")}`, ephemeral: true })
            }
            else {
                queue.songs = []
                queue.player.stop()
                interaction.reply(`${__("stopped")} ${__("kirino_glad")}`)
            }
        }
        else {
            interaction.reply({ content: `${__("not_allowed_to_control_music_because_not_in_my_voice_channel")} ${__("kirino_pout")}`, ephemeral: true })
        }
    }
}