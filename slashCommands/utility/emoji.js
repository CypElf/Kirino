const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("emoji")
        .setDescription(__("description_emoji"))
        .addStringOption(option => option.setName("emoji").setDescription("The emoji you want to get the image").setRequired(true)),
    guildOnly: false,

    async execute(bot, interaction) {
        const raw = interaction.options.getString("emoji")

        let emoji = raw.match(/<:(.*?):[0-9]*>/gm)
        let extension = "png"

        if (!emoji) {
            emoji = raw.match(/<a:(.*?):[0-9]*>/gm)
            extension = "gif"
        }

        if (!emoji) return interaction.reply({ content: __("specify_custom_emojis"), ephemeral: true })

        const emojiId = emoji.toString().split(":")[2].split(">").slice(0, -1).join(">")

        interaction.reply(`https://cdn.discordapp.com/emojis/${emojiId}.${extension}`)
    }
}