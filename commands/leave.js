module.exports = {
	name: "leave",
    guildOnly: true,
    args: false,
    category: "others",

    async execute (bot, msg) {
        const guild = await bot.guilds.fetch(msg.guild.id)
        const botMember = await guild.members.fetch(bot.user.id)
        if (botMember.voice.channel) {
            const musicAuth = require("../lib/music/music_control_auth")

            if (musicAuth(msg.channel, msg.member, msg.guild.me)) {
                botMember.voice.channel.leave()
                msg.channel.send(`${__("voice_channel_left")} ${__("kirino_glad")}`)
            }
        }
        else {
            msg.channel.send(`${__("already_not_in_any_voice_channel")} ${__("kirino_pout")}`)
        }
    }
}