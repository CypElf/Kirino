module.exports = {
	name: "skip",
    guildOnly: true,
    args: false,
    category: "others",

    async execute (bot, msg) {
        const queue = bot.voicesQueues.get(msg.guild.id)

        const musicAuth = require("../lib/music/music_control_auth")

        if (musicAuth(msg.channel, msg.member, msg.guild.me)) {
            if (queue.songs.length === 0) {
                msg.channel.send(`${__("nothing_to_skip")} ${__("kirino_pout")}`)
            }
            else {
                queue.connection.dispatcher.end()
                msg.channel.send(`${__("skipped")} ${__("kirino_glad")}`)
            }
        }
    }
}