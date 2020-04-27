module.exports = {
	name: "report",
    description: "description_report",
    guildOnly: false,
	args: true,
	category: "others",
	usage: "usage_report",
	
	async execute(bot, msg, args) {
        let origin
        let originAvatar
        if (msg.channel.type === "text") {
            if (!msg.guild.me.hasPermission("ADD_REACTIONS")) {
                return msg.channel.send(__("cannot_react_to_messages") + " <:kirinopout:698923065773522944>")
            }
            origin = msg.guild.name
            originAvatar = msg.guild.iconURL()
        }
        else {
            origin = "DM"
            originAvatar = msg.author.displayAvatarURL()
        }
        const report = args.join(" ")
        let confirmationMsg = await msg.channel.send(__("report_confirmation") + "\n```" + report + "``` " + __("thirty_seconds_before_auto_cancelling"))

        confirmationMsg.react('✅')
        confirmationMsg.react('❌')

        const filter = (reaction, user) => {
            return reaction.emoji.name === '✅' && user.id === msg.author.id || reaction.emoji.name === '❌' && user.id === msg.author.id
        }
        const collector = confirmationMsg.createReactionCollector(filter, { max: 1, time: 30_000 })

        collector.on("collect", (reaction) => {
            if (reaction.emoji.name === '✅') {
                const kirinoDebug = bot.guilds.cache.find(guild => {
                    return guild.id === bot.config.kirinoDebugID
                })
                if (kirinoDebug) {
                    const reportChannel = kirinoDebug.channels.cache.find(channel => {
                        return channel.id === bot.config.reportChannelID
                    })
                    if (reportChannel) {
                        const Discord = require("discord.js")

                        const senderLanguage = getLocale()

                        const db = new bsqlite3("database.db", { fileMustExist: true })
                        const languagesRequest = db.prepare("SELECT * FROM languages WHERE id = ?")
                        const languageRow = languagesRequest.get(bot.config.kirinoDebugID)
                        if (!(languageRow === undefined)) {
                            setLocale(languageRow.language)
                        }
                        else {
                            setLocale("en")
                        }
    
                        let reportEmbed = new Discord.MessageEmbed()
                            .setTitle("**" + __("new_report") + "**")
                            .setThumbnail(originAvatar)
                            .setDescription("**" + __("report_origin") + "** " + origin + "\n**" + __("message") + " :** " + report)
                            .setColor("#CC0101")
                            .setFooter(__("report_from") + msg.author.tag, msg.author.displayAvatarURL())
                        reportChannel.send(reportEmbed)

                        setLocale(senderLanguage)
                    }
                    else {
                        return msg.channel.send(__("report_channel_unavailable") + " <:kirinowhat:698923096752783401> " + __("contact_dev"))
                    }
                }
                else {
                    return msg.channel.send(__("report_server_unavailable") + " <:kirinowhat:698923096752783401> " + __("contact_dev"))
                }
                msg.channel.send(__("report_sent") + " <:kirinoglad:698923046819594351> !")
            }
            else {
                msg.channel.send(__("report_cancelled"))
            }
        })
	}
}