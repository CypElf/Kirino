const { SlashCommandBuilder } = require("@discordjs/builders")
const toChunks = require("../../lib/string/to_chunks")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("queue")
        .setDescription(__("description_queue")),
    guildOnly: true,

    async execute(bot, interaction) {
        const queue = bot.voicesQueues.get(interaction.guild.id)

        if (!interaction.guild.me.voice.channel) {
            interaction.reply({ content: `${__("not_in_any_voice_channel")} ${__("kirino_pout")}`, ephemeral: true })
        }
        else if (queue.songs.length === 0) {
            interaction.reply(`${__("queue_empty")} ${__("kirino_glad")}`)
        }
        else {
            const text = `${__("songs_in_queue_are")}\n- ${queue.songs.map(song => song.title).join("\n- ")}`
            const textArray = toChunks(text, 2000)

            interaction.reply(textArray[0])
            for (const chunk of textArray.slice(1)) {
                interaction.channel.send(chunk)
            }
        }
    }
}