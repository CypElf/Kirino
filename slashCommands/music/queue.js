const { SlashCommandBuilder } = require("@discordjs/builders")
const { Util } = require("discord.js")
const t = require("i18next").t.bind(require("i18next"))

module.exports = {
    data: new SlashCommandBuilder()
        .setName("queue")
        .setDescription("Display what songs are currently in the queue"),
    guildOnly: true,

    async execute(bot, interaction) {
        const queue = bot.voicesQueues.get(interaction.guild.id)

        if (!interaction.guild.me.voice.channel) {
            interaction.reply({ content: `${t("not_in_any_voice_channel")} ${t("common:kirino_pout")}`, ephemeral: true })
        }
        else if (queue.songs.length === 0) {
            interaction.reply(`${t("queue_empty")} ${t("common:kirino_glad")}`)
        }
        else {
            const text = `${t("songs_in_queue_are")}\n- ${queue.songs.map(song => song.title).join("\n- ")}`
            const textArray = Util.splitMessage(text)

            interaction.reply(textArray[0])
            for (const chunk of textArray.slice(1)) {
                interaction.followUp(chunk)
            }
        }
    }
}