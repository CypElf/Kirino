module.exports = {
	name: "join",
    guildOnly: true,
    args: false,
    category: "others",
    permissions: ["connect", "speak"],

    async execute (bot, msg) {
        if (msg.member.voice.channel) {
            if (msg.guild.me.hasPermission("CONNECT")) {
                if (msg.guild.me.hasPermission("SPEAK")) {

                    const connection = await msg.member.voice.channel.join()
                    msg.channel.send(`${__("voice_channel_joined")} ${__("kirino_glad")}`)
    
                    bot.voicesQueues.set(msg.guild.id, {
                        connection: connection,
                        songs: [],
                        volume: 1
                    })
                }
                else {
                    msg.channel.send(`${__("missing_perm_connect")} ${__("kirino_pout")}`)
                }
            }
            else {
                msg.channel.send(`${__("missing_perm_speak")} ${__("kirino_pout")}`)
            }
        }
        else {
            msg.channel.send(`${__("you_are_not_in_any_voice_channel")} ${__("kirino_pff")}`)
        }
    }
}