function getChannel(msg, args) {
    let channel = msg.mentions.channels.first()
    if (channel === undefined) {
        let channelNameOrID = args.join(" ")
        channel = msg.guild.channels.cache.array().find(currentChannel => currentChannel.name.toLowerCase() === channelNameOrID.toLowerCase())
        if (channel === undefined) {
            channel = msg.guild.channels.cache.array().find(currentChannel => currentChannel.id === channelNameOrID)
        }
    }

    return channel
}

module.exports = getChannel;