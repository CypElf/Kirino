module.exports = {
    name: "serverpicture",
    guildOnly: true,
    args: false,
    aliases: ["sp", "serveravatar", "sa"],
    category: "utility",

    async execute (bot, msg) {
        msg.channel.send(msg.guild.iconURL({
            dynamic: true,
            size: 4096
        }))
    }
}