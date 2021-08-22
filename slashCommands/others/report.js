const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed, Permissions } = require("discord.js")
const i18next = require("i18next")
const t = i18next.t.bind(i18next)

module.exports = {
    data: new SlashCommandBuilder()
        .setName("report")
        .setDescription("Allow you to submit a report to suggest new features, bugs, or anything that can improve me")
        .addStringOption(option => option.setName("message").setDescription("The message you want to send as a report").setRequired(true)),
    guildOnly: false,
    cooldown: 5,

    async execute(bot, interaction) {
        const report = interaction.options.getString("message")

        let origin
        let originAvatar
        if (interaction.guild) {
            if (!interaction.guild.me.permissions.has(Permissions.FLAGS.ADD_REACTIONS)) return interaction.reply({ content: `${t("cannot_react_to_messages")} ${t("common:kirino_pout")}`, ephemeral: true })
            origin = interaction.guild.name
            originAvatar = interaction.guild.iconURL()
        }
        else {
            origin = "DM"
            originAvatar = interaction.user.displayAvatarURL()
        }

        await interaction.reply(t("report_confirmation") + "\n```" + report + "``` " + t("thirty_seconds_before_auto_cancelling"))
        const confirmationMsg = await interaction.fetchReply()

        confirmationMsg.react("✅")
        confirmationMsg.react("❌")

        const filter = (reaction, user) => reaction.emoji.name === "✅" && user.id === interaction.user.id || reaction.emoji.name === "❌" && user.id === interaction.user.id
        const collector = confirmationMsg.createReactionCollector({ filter, max: 1, time: 30_000 })

        const senderLanguage = i18next.language

        collector.on("collect", async reaction => {
            await i18next.changeLanguage(senderLanguage) // in case another command is done and the language / namespace changed while the collector was waiting
            i18next.setDefaultNamespace("report")
            if (reaction.emoji.name === "✅") {
                const kirinoDebug = bot.guilds.cache.find(guild => guild.id === process.env.DEBUG_SERVER_ID)
                if (kirinoDebug) {
                    const reportChannel = kirinoDebug.channels.cache.find(channel => channel.id === process.env.REPORT_CHANNEL_ID)
                    if (reportChannel) {
                        const debugServerLanguage = bot.db.prepare("SELECT * FROM languages WHERE id = ?").get(process.env.DEBUG_SERVER_ID)?.language ?? "en"
                        await i18next.changeLanguage(debugServerLanguage)

                        const reportEmbed = new MessageEmbed()
                            .setTitle("**" + t("new_report") + "**")
                            .setThumbnail(originAvatar)
                            .setDescription("**" + t("report_origin") + "** " + origin + "\n**" + t("message") + " :** " + report)
                            .setColor("#CC0101")
                            .setFooter(t("report_from") + interaction.user.tag, interaction.user.displayAvatarURL())

                        await reportChannel.send({ embeds: [reportEmbed] })

                        await i18next.changeLanguage(senderLanguage)
                        interaction.followUp(`${t("report_sent")} ${t("common:kirino_glad")} !`)
                    }
                    else interaction.followUp(`${t("report_channel_unavailable")} ${t("common:kirino_what")} ${t("contact_dev")}`)
                }
                else interaction.followUp(`${t("report_server_unavailable")} ${t("common:kirino_what")} ${t("contact_dev")}`)
            }
            else interaction.followUp(t("report_cancelled"))
        })
    }
}