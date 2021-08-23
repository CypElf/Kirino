const { SlashCommandBuilder } = require("@discordjs/builders")
const { Permissions } = require("discord.js")
const t = require("i18next").t.bind(require("i18next"))

module.exports = {
    data: new SlashCommandBuilder()
        .setName("react")
        .setDescription("Make me react to a message")
        .addStringOption(option => option.setName("message_id").setDescription("The ID of the message you want me to react to").setRequired(true))
        .addStringOption(option => option.setName("emoji").setDescription("The emoji you want to me react with").setRequired(true)),
    guildOnly: false,
    permissions: ["administrator"],

    async execute(bot, interaction) {
        if (interaction.user.id !== process.env.OWNER_ID && !interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
            return interaction.reply({ content: `${t("not_allowed_to_use_this_command")} ${t("common:kirino_pff")}`, ephemeral: true })
        }

        if (interaction.guild && !interaction.guild.me.permissions.has(Permissions.FLAGS.ADD_REACTIONS)) {
            return interaction.reply({ content: `${t("cannot_react_to_messages")} ${t("common:kirino_pout")}`, ephemeral: true })
        }

        const message_id = interaction.options.getString("message_id")
        const emoji = interaction.options.getString("emoji")

        const msg = await interaction.channel.messages.fetch(message_id)
            .catch(() => {
                return interaction.reply({ content: t("bad_message_id") + " " + t("common:kirino_pout"), ephemeral: true })
            })

        try {
            await msg.react(emoji) // work only for default emojis
        }
        catch {
            let customEmoji = emoji.match(/<:(.*?):[0-9]*>/gm)
            if (customEmoji) customEmoji = customEmoji.map(fullEmoji => fullEmoji.split(":")[2].split(">")[0])[0]

            try {
                await msg.react(customEmoji)
            }
            catch {
                return interaction.reply({ content: t("access_to_emoji_denied") + " " + t("common:kirino_pout"), ephemeral: true })
            }
        }

        interaction.reply(`${t("reaction_added")} ${t("common:kirino_glad")}`)
    }
}