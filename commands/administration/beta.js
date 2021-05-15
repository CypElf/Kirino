module.exports = {
	name: "beta",
    guildOnly: false,
    permissions: ["manage_guild"],

    async execute (bot, msg, args) {
        if (msg.guild && !msg.member.hasPermission("MANAGE_SERVER")) {
            return msg.channel.send(`${__("missing_permissions_to_enable_beta")} ${__("kirino_pout")}`)
        }

        const id = msg.guild ? msg.guild.id : msg.author.id
        const isBetaEnabled = bot.db.prepare("SELECT * FROM beta WHERE id = ?").get(id) !== undefined

        if (args[0] === undefined) {
            if (isBetaEnabled) {
                msg.channel.send(`${__("beta_is_enabled")} ${__("kirino_glad")}`)
            }
            else {
                msg.channel.send(`${__("beta_is_disabled")} ${__("kirino_glad")}`)
            }
        }

        else {
            const choice = args[0].toLowerCase()

            if (choice !== "enable" && choice !== "disable") {
                return msg.channel.send(`${__("invalid_beta_mode")} ${__("kirino_pout")}`)
            }
    
            const id = msg.guild ? msg.guild.id : msg.author.id
            const isBetaEnabled = bot.db.prepare("SELECT * FROM beta WHERE id = ?").get(id) !== undefined
    
            if (choice === "enable") {
                if (isBetaEnabled) {
                    msg.channel.send(`${__("beta_already_enabled")} ${__("kirino_glad")}`)
                }
                else {
                    bot.db.prepare("INSERT INTO beta VALUES(?)").run(id)
                    msg.channel.send(`${__("beta_enabled")} ${__("kirino_glad")}`)
                }
            }
            else {
                if (!isBetaEnabled) {
                    msg.channel.send(`${__("beta_already_disabled")} ${__("kirino_glad")}`)
                }
                else {
                    bot.db.prepare("DELETE FROM beta WHERE id = ?").run(id)
                    msg.channel.send(`${__("beta_disabled")} ${__("kirino_glad")}`)
                }
            }
        }        
    }
}