const { MessageEmbed, Permissions } = require("discord.js")

module.exports = {
    name: "report",
    guildOnly: false,
    args: true,
    cooldown: 5,

    async execute(bot, msg, args) {
        let origin
        let originAvatar
        if (msg.guild) {
            if (!msg.guild.me.permissions.has(Permissions.FLAGS.ADD_REACTIONS)) return msg.channel.send(`${__("cannot_react_to_messages")} ${__("kirino_pout")}`)
            origin = msg.guild.name
            originAvatar = msg.guild.iconURL()
        }
        else {
            origin = "DM"
            originAvatar = msg.author.displayAvatarURL()
        }
        const report = args.join(" ")
        const confirmationMsg = await msg.channel.send(__("report_confirmation") + "\n```" + report + "``` " + __("thirty_seconds_before_auto_cancelling"))

        confirmationMsg.react("✅")
        confirmationMsg.react("❌")

        const filter = (reaction, user) => reaction.emoji.name === "✅" && user.id === msg.author.id || reaction.emoji.name === "❌" && user.id === msg.author.id
        const collector = confirmationMsg.createReactionCollector({ filter, max: 1, time: 30_000 })

        collector.on("collect", async reaction => {
            if (reaction.emoji.name === "✅") {
                const kirinoDebug = bot.guilds.cache.find(guild => guild.id === process.env.DEBUG_SERVER_ID)
                if (kirinoDebug) {
                    const reportChannel = kirinoDebug.channels.cache.find(channel => channel.id === process.env.REPORT_CHANNEL_ID)
                    if (reportChannel) {

                        const senderLanguage = getLocale()

                        const languagesRequest = bot.db.prepare("SELECT * FROM languages WHERE id = ?")
                        const languageRow = languagesRequest.get(process.env.DEBUG_SERVER_ID)
                        if (!(languageRow === undefined)) setLocale(languageRow.language)
                        else setLocale("en")

                        const reportEmbed = new MessageEmbed()
                            .setTitle("**" + __("new_report") + "**")
                            .setThumbnail(originAvatar)
                            .setDescription("**" + __("report_origin") + "** " + origin + "\n**" + __("message") + " :** " + report)
                            .setColor("#CC0101")
                            .setFooter(__("report_from") + msg.author.tag, msg.author.displayAvatarURL())
                        await reportChannel.send({ embeds: [reportEmbed] })

                        setLocale(senderLanguage)
                        msg.channel.send(`${__("report_sent")} ${__("kirino_glad")} !`)
                    }
                    else msg.channel.send(`${__("report_channel_unavailable")} ${__("kirino_what")} ${__("contact_dev")}`)
                }
                else msg.channel.send(`${__("report_server_unavailable")} ${__("kirino_what")} ${__("contact_dev")}`)
            }
            else msg.channel.send(__("report_cancelled"))
        })
    }
}