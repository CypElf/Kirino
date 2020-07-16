module.exports = {
	name: "xp",
    description: "description_xp",
    guildOnly: true,
    args: false,
    category: "utility",
    usage: "usage_xp",

    async execute (bot, msg, args) {
        const bsqlite3 = require("better-sqlite3")
        const db = new bsqlite3("database.db", { fileMustExist: true })

        if (args[0] === "enable" || args[0] === "disable") {
            const enableRequest = db.prepare("INSERT INTO xp_activations(guild_id,enabled) VALUES(?,?) ON CONFLICT(guild_id) DO UPDATE SET enabled=excluded.enabled")

            if (args[0] === "enable") {
                enableRequest.run(msg.guild.id, 1)
                msg.channel.send("Système d'XP activé !")
            }

            else {
                enableRequest.run(msg.guild.id, 0)
                msg.channel.send("Système d'XP désactivé !")
            }
        }

        else {
            let member

            if (args.length === 0) {
                member = msg.member
            }
    
            else {
                const getUser = require("../res/get_user")
    
                member = getUser(msg, args)
                if (member === undefined) {
                    return msg.channel.send(__("please_correctly_write_or_mention_a_member") + " <:kirinopout:698923065773522944>")
                }
                else if (member.user.bot) {
                    return msg.channel.send("Bots are not allowed")
                }
            }
            
            const xpActivationRequest = db.prepare("SELECT enabled FROM xp_activations WHERE guild_id = ?")
            let isEnabled = xpActivationRequest.get(msg.guild.id).enabled
    
            if (isEnabled === undefined) {
                isEnabled = 0
                const xpDisabledRequest = db.prepare("INSERT INTO xp_activations(guild_id,enabled) VALUES(?,?)")
                xpDisabledRequest.run(msg.guild.id, 0)
            }
    
            if (isEnabled) {
                const xpRequest = db.prepare("SELECT xp, level FROM xp WHERE guild_id = ? AND user_id = ?")
                let xpRow = xpRequest.get(msg.guild.id, member.id)
    
                if (xpRow === undefined) {
                    xpRow = { guild_id: msg.guild.id, user_id: member.id, xp: 0, level: 0 }
                    const xpUpdateRequest = db.prepare("INSERT INTO xp VALUES(?,?,?,?)")
                    xpUpdateRequest.run(msg.guild.id, member.id, 0, 0)
                }
    
                const nextLvlXp = 5 * (xpRow.level * xpRow.level) + 50 * xpRow.level + 100
                const percent = (xpRow.xp / nextLvlXp * 100).toFixed(1)
    
                msg.channel.send(`${member.user.username} : niveau ${xpRow.level}, ${xpRow.xp} XP. Le prochain niveau sera atteint à ${nextLvlXp} (${percent}% atteints).`)
            }
    
            else {
                msg.channel.send("Le système d'XP est désactivé, sur ce serveur.")
            }
        }
    }
}