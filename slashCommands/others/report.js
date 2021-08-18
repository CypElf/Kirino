const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed, Permissions } = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("report")
        .setDescription(__("description_report"))
        .addStringOption(option => option.setName("message").setDescription("The message you want to send as a report").setRequired(true)),
    guildOnly: false,
    cooldown: 5,

    async execute(bot, interaction) {
        const report = interaction.options.getString("message")

        let origin
        let originAvatar
        if (interaction.guild) {
            if (!interaction.guild.me.permissions.has(Permissions.FLAGS.ADD_REACTIONS)) return interaction.reply({ content: `${__("cannot_react_to_messages")} ${__("kirino_pout")}`, ephemeral: true })
            origin = interaction.guild.name
            originAvatar = interaction.guild.iconURL()
        }
        else {
            origin = "DM"
            originAvatar = interaction.user.displayAvatarURL()
        }

        await interaction.reply(__("report_confirmation") + "\n```" + report + "``` " + __("thirty_seconds_before_auto_cancelling"))
        const confirmationMsg = await interaction.fetchReply()

        confirmationMsg.react("✅")
        confirmationMsg.react("❌")

        const filter = (reaction, user) => reaction.emoji.name === "✅" && user.id === interaction.user.id || reaction.emoji.name === "❌" && user.id === interaction.user.id
        const collector = confirmationMsg.createReactionCollector({ filter, max: 1, time: 30_000 })

        collector.on("collect", async reaction => {
            if (reaction.emoji.name === "✅") {
                const kirinoDebug = bot.guilds.cache.find(guild => guild.id === process.env.DEBUG_SERVER_ID)
                if (kirinoDebug) {
                    const reportChannel = kirinoDebug.channels.cache.find(channel => channel.id === process.env.REPORT_CHANNEL_ID)
                    if (reportChannel) {
                        const senderLanguage = getLocale()

                        const debugServerLanguage = bot.db.prepare("SELECT * FROM languages WHERE id = ?").get(process.env.DEBUG_SERVER_ID)?.language ?? "en"
                        setLocale(debugServerLanguage)

                        const reportEmbed = new MessageEmbed()
                            .setTitle("**" + __("new_report") + "**")
                            .setThumbnail(originAvatar)
                            .setDescription("**" + __("report_origin") + "** " + origin + "\n**" + __("message") + " :** " + report)
                            .setColor("#CC0101")
                            .setFooter(__("report_from") + interaction.user.tag, interaction.user.displayAvatarURL())
                        
                        await reportChannel.send({ embeds: [reportEmbed] })

                        setLocale(senderLanguage)
                        interaction.followUp(`${__("report_sent")} ${__("kirino_glad")} !`)
                    }
                    else interaction.followUp(`${__("report_channel_unavailable")} ${__("kirino_what")} ${__("contact_dev")}`)
                }
                else interaction.followUp(`${__("report_server_unavailable")} ${__("kirino_what")} ${__("contact_dev")}`)
            }
            else interaction.followUp(__("report_cancelled"))
        })
    }
}