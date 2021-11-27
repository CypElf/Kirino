const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js")
const i18next = require("i18next")
const t = i18next.t.bind(i18next)

module.exports = {
    data: new SlashCommandBuilder()
        .setName("report")
        .setDescription("Allow you to submit a report to suggest new features, bugs, or anything that can improve me")
        .addStringOption(option => option.setName("message").setDescription("The message you want to send as a report").setRequired(true)),
    guildOnly: true,
    cooldown: 5,

    async execute(bot, interaction) {
        const report = interaction.options.getString("message")

        let origin
        let originAvatar
        if (interaction.guild) {
            origin = interaction.guild.name
            originAvatar = interaction.guild.iconURL()
        }
        else {
            origin = "DM"
            originAvatar = interaction.user.displayAvatarURL()
        }

        const filter = i => {
            i.deferUpdate()
            return i.user.id === interaction.user.id && i.customId === "confirmed" || i.customId === "cancelled"
        }

        const actionRow = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId("confirmed")
                    .setLabel(t("confirm"))
                    .setStyle("SUCCESS"),
                new MessageButton()
                    .setCustomId("cancelled")
                    .setLabel(t("cancel"))
                    .setStyle("SECONDARY")
            )

        await interaction.reply({ content: t("report_confirmation") + "\n```" + report + "```", components: [actionRow] })
        const confirmationMsg = await interaction.fetchReply()

        const collector = confirmationMsg.createMessageComponentCollector({ filter, componentType: "BUTTON", time: 30_000 })

        const senderLanguage = i18next.language

        collector.on("collect", async i => {
            await i18next.changeLanguage(senderLanguage) // in case another command is done and the language / namespace changed while the collector was waiting
            i18next.setDefaultNamespace("report")

            if (i.customId === "confirmed") {
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

                        const msg = await reportChannel.send({ embeds: [reportEmbed] })
                        msg.react("💬")

                        await i18next.changeLanguage(senderLanguage)
                        interaction.editReply({ content: `${t("report_sent")} ${t("common:kirino_glad")} !`, components: [] })
                    }
                    else {
                        console.error("Report channel unavailable")
                        interaction.editReply({ content: `${t("report_channel_unavailable")} ${t("common:kirino_what")}`, components: [] })
                    }
                }
                else {
                    console.error("Report server unavailable")
                    interaction.editReply({ content: `${t("report_server_unavailable")} ${t("common:kirino_what")}`, components: [] })
                }
            }
            else interaction.editReply({ content: t("report_cancelled"), components: [] })
        })
    }
}