module.exports = {
	name: "leave",
    guildOnly: true,
    args: false,
    category: "others",

    async execute (bot, msg, args) {
        const guild = await bot.guilds.fetch(msg.guild.id)
        const botMember = await guild.members.fetch(bot.user.id)
        if (botMember.voice.channel) {
            botMember.voice.channel.leave()
            msg.channel.send("I left the voice channel.")
        }
        else {
            msg.channel.send("I'm already not in any voice channel.")
        }
    }
}