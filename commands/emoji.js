module.exports = {
	name: "emoji",
    description: "description_emoji",
    guildOnly: true,
    args: true,
    aliases: ["emote"],
    category: "utility",
    usage: "usage_emoji",

    async execute (bot, msg, args) {
        let emojis = []
        for (const arg of args) {
            let extension = "png"
            let emoji = arg.match(/<:(.*?):[0-9]*>/gm)
            if (!emoji) {
                emoji = arg.match(/<a:(.*?):[0-9]*>/gm)
                extension = "gif"
            }
            if (emoji) emojis.push([emoji.toString().split(":")[2].split(">").slice(0, -1).join(">"), extension])
        }
        
        if (emojis.length === 0) return msg.channel.send(__("specify_custom_emojis"))
        if (emojis.length > 5) return msg.channel.send(__("five_emojis_max"))
        for (const [emojiID, extension] of emojis) {
            msg.channel.send(`https://cdn.discordapp.com/emojis/${emojiID}.${extension}`)
        }
    }
}