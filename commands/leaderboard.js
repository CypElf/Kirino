module.exports = {
	name: "leaderboard",
    description: "description_leaderboard",
    guildOnly: true,
    args: false,
    category: "utility",
    usage: "usage_leaderboard",
    aliases: [ "lb" ],

    async execute (bot, msg, args) {
        msg.channel.send(`${msg.guild.name}'s leaderboard is available at https://www.avdray.com/leaderboards?gid=${msg.guild.id}`)
    }
}