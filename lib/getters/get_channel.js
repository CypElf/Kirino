async function getChannel(msg, args) {
    let channel = msg.mentions.channels.array().filter(channel => channel.type === "text")
    if (channel.length === 0) {
        let channelNameOrID = args.join(" ")
        channel = msg.guild.channels.cache.array().filter(channel => channel.type === "text").find(currentChannel => currentChannel.name.toLowerCase() === channelNameOrID.toLowerCase())
        if (channel === undefined) {
            channel = msg.guild.channels.cache.array().filter(channel => channel.type === "text").find(currentChannel => currentChannel.id === channelNameOrID)

            if (channel === undefined) {
                let results = msg.guild.channels.cache.array().filter(channel => channel.name.toLowerCase().indexOf(channelNameOrID.toLowerCase()) >= 0 && channel.type === "text").slice(0, 10)
                
                if (results.length === 1) channel = results[0]
                else if (results.length > 1) {
                    const printableResults = results.map((channel, i) => (i + 1) + " - " + channel.name).join("\n")
                    const choicesMsg = await msg.channel.send(`${__("i_found")} ${results.length} ${__("channels_who_do_you_want")}\n${printableResults}\nN - ${__("nothing")}`)

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
    else channel = channel[0]

    return channel
}

module.exports = getChannel;