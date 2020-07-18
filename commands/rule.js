module.exports = {
	name: "rule",
    description: "description_rule",
    guildOnly: true,
    args: true,
    usage: "usage_rule",
    aliases: ["r"],
    category: "admin",
    permissions: ["manage guild"],
    
    async execute(bot, msg, args) {
        const request = args[0]

        // ------------------------------------------------------------------- add

        if (request === "add") {
            if (!msg.member.hasPermission("MANAGE_GUILD")) return msg.channel.send(__("not_enough_permissions_to_add_rule") + " <:kirinopff:698922942268047391>")
            const newRule = args.slice(1).join(" ")
            if (!newRule) {
                return msg.channel.send(__("please_enter_a_rule_to_add") + " <:kirinopout:698923065773522944>")
            }
            if (newRule.length > 1000) return msg.channel.send(__("rule_too_long")  + " <:kirinopout:698923065773522944>")

            let r = getRules(false).length
            if (r >= 30) return msg.channel.send(__("max_rules_number_reached") + " <:kirinopout:698923065773522944>")
            const newRuleRequest = bot.db.prepare("INSERT INTO rules(guild_id,rule) VALUES(?,?)")
            newRuleRequest.run(msg.guild.id, newRule)

            return msg.channel.send(__("the_following_rule") + "\n```" + newRule + "```\n" + __("has_been_added_to_rules"))
        }

        // ------------------------------------------------------------------- remove

        else if (request === "remove") {
            if (!msg.member.hasPermission("MANAGE_GUILD")) return msg.channel.send(__("not_enough_permissions_to_add_rule") + " <:kirinopff:698922942268047391>")
            if (!args[1]) return msg.channel.send(__("please_enter_a_rule_do_delete") + " <:kirinopout:698923065773522944>")

            const index = parseInt(args.slice(1)[0]) - 1

            if (!index && index !== 0) {
                return msg.channel.send(__("please_enter_a_valid_rule_number") + " <:kirinopff:698922942268047391>")
            }

            let rules = getRules()
            if (rules.length === 0) {
                return
            }

            rules = rules.map(row => row.rule)

            if (index < 0 || index >= rules.length) {
                return msg.channel.send(__("no_rules_defined_at_this_index") + " <:kirinopout:698923065773522944>")
            }

            rules.splice(index, 1)

            const deleteRequest = bot.db.prepare("DELETE FROM rules WHERE guild_id = ?")
            deleteRequest.run(msg.guild.id)

            if (rules.length !== 0) {
                const newRuleRequest = bot.db.prepare("INSERT INTO rules(guild_id,rule) VALUES(?,?)")
                rules.forEach(rule => {
                    newRuleRequest.run(msg.guild.id, rule)
                })
            }

            return msg.channel.send(__("the_rule_number_n") + " " + (index + 1) + " " + __("has_been_deleted_from_rules"))
        }

        // ------------------------------------------------------------------- count

        else if (request === "count") {
            let rulesCount = getRules(false).length
            return msg.channel.send(__n("there_is_currently", rulesCount) + " " + rulesCount + " " + __n("rules_on_this_server", rulesCount))
        }

        // ------------------------------------------------------------------- display rule

        const index = parseInt(request) - 1

        if (!index && index !== 0) {
            return msg.channel.send(__("please_enter_a_valid_rule_number") + " <:kirinopff:698922942268047391>")
        }
        
        let rules = getRules()
        if (rules.length === 0) return

        rules = rules.map(row => row.rule)
        const askedRule = rules[index]

        if (!askedRule) {
            return msg.channel.send(__("no_rules_defined_at_this_index") + " <:kirinopout:698923065773522944>")
        }

        const Discord = require("discord.js")
        const emb = new Discord.MessageEmbed()
            .addField(__("rule_title") + (index + 1), askedRule)
            .setColor("#000000")
            
        emb.setFooter(__("rules_from") + msg.guild.name, msg.guild.iconURL())
        msg.channel.send(emb)

        function getRules(verbose = true) {
            const rulesRequest = bot.db.prepare("SELECT * FROM rules WHERE guild_id = ?")
            const rulesRow = rulesRequest.all(msg.guild.id)
    
            if (rulesRow.length === 0 && verbose) {
                msg.channel.send(__("no_rules_defined_on_this_server"))
            }
    
            return rulesRow
        }
    }
}