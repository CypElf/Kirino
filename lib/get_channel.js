async function getChannel(msg, args) {
    let channel = msg.mentions.channels.first()
    if (channel === undefined) {
        let channelNameOrID = args.join(" ")
        channel = msg.guild.channels.cache.array().find(currentChannel => currentChannel.name.toLowerCase() === channelNameOrID.toLowerCase())
        if (channel === undefined) {
            channel = msg.guild.channels.cache.array().find(currentChannel => currentChannel.id === channelNameOrID)

            if (channel === undefined) {
                let results = msg.guild.channels.cache.array().filter(channel => channel.name.toLowerCase().indexOf(channelNameOrID.toLowerCase()) >= 0).slice(0, 10)
                
                if (results.length === 1) channel = results[0]
                else if (results.length > 1) {
                    const printableResults = results.map((channel, i) => (i + 1) + " - " + channel.name).join("\n")
                    const choicesMsg = await msg.channel.send(`${__("i_found")} ${results.length} ${__("channels_who_do_you_want")}\n${printableResults}\nN - ${__("nobody")}`)

                    const filter = cMsg => cMsg.author.id === msg.author.id && cMsg.content.toUpperCase() === "N" || (!isNaN(cMsg.content) && cMsg.content > 0 && cMsg.content <= results.length)
                    try {
                        let cMsg = await msg.channel.awaitMessages(filter, { max: 1, time: 30_000 })
                        cMsg = cMsg.array()
                        if (cMsg.length === 1) {
                            if (cMsg[0].content.toUpperCase() !== "N") channel = results[cMsg[0].content - 1]

                            cMsg[0].delete().catch(() => {})
                        }
                    }
                    catch {}

                    choicesMsg.delete().catch(() => {})
                }
            }
        }
    }

    return channel
}

module.exports = getChannel;