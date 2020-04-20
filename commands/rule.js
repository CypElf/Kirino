module.exports = {
	name: "rule",
    description: "description_rule",
    guildOnly: true,
    args: true,
    usage: "usage_rule",
    aliases: ["r"],
    category: "admin",
    
    async execute(bot, msg, args) {
        const bsqlite3 = require("better-sqlite3");
        let db = new bsqlite3("database.db", { fileMustExist: true });
        
        const request = args[0];
        if (request === "add") {
            if (!msg.member.hasPermission("MANAGE_GUILD")) return msg.channel.send(__("not_enough_permissions_to_add_rule") + " <:kirinopff:698922942268047391>");
            const newRule = args.slice(1).join(" ");
            if (!newRule) {
                return msg.channel.send(__("please_enter_a_rule_to_add") + " <:kirinopout:698923065773522944>");
            }
            if (newRule.length > 1000) return msg.channel.send(__("rule_too_long")  + " <:kirinopout:698923065773522944>");
            if (newRule.includes("|")) return msg.channel.send(__("cannot_store_|") + " <:kirinopout:698923065773522944>");

            let r = getRules(false);
            if (!r) r = 0;
            else r = r.rules.split("|").length;
            if (r >= 30) return msg.channel.send(__("max_rules_number_reached") + " <:kirinopout:698923065773522944>");
            const newRuleRequest = db.prepare("INSERT INTO rules(id,rules) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET rules=rules || '|' || excluded.rules");
            newRuleRequest.run(msg.guild.id, newRule);

            return msg.channel.send(__("the_following_rule") + "\n```" + newRule + "```\n" + __("has_been_added_to_rules"));
        }

        else if (request === "remove") {
            if (!msg.member.hasPermission("MANAGE_GUILD")) return msg.channel.send(__("not_enough_permissions_to_add_rule") + " <:kirinopff:698922942268047391>");
            if (!args[1]) return msg.channel.send(__("please_enter_a_rule_do_delete") + " <:kirinopout:698923065773522944>");

            const index = parseInt(args.slice(1)[0]) - 1;

            if (!index && index !== 0) {
                return msg.channel.send(__("please_enter_a_valid_rule_number") + " <:kirinopff:698922942268047391>");
            }

            const rules = getRules();
            if (!rules) {
                return;
            }

            let newRulesArray = rules.rules.split("|");

            if (index < 0 || index >= newRulesArray.length) {
                return msg.channel.send(__("no_rules_defined_at_this_index") + " <:kirinopout:698923065773522944>");
            }

            newRulesArray.splice(index, 1);

            const newRules = newRulesArray.join("|");
            if (newRules.length < 1) {
                const deleteCommand = db.prepare("DELETE FROM rules WHERE id = ?");
                deleteCommand.run(msg.guild.id);
            }
            else {
                const deleteCommand = db.prepare("INSERT INTO rules(id,rules) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET rules=excluded.rules");
                deleteCommand.run(msg.guild.id, newRules);
            }
            return msg.channel.send(__("the_rule_number_n") + " " + (index + 1) + " " + __("has_been_deleted_from_rules"));
        }

        else if (request === "count") {
            let rulesCount = getRules(false);
            if (!rulesCount) rulesCount = 0;
            else rulesCount = rulesCount.rules.split("|").length;
            return msg.channel.send(__n("there_is_currently", rulesCount) + " " + rulesCount + " " + __n("rules_on_this_server", rulesCount));
        }

        const index = parseInt(request) - 1;

        if (!index && index !== 0) {
            return msg.channel.send(__("please_enter_a_valid_rule_number") + " <:kirinopff:698922942268047391>");
        }
                
        const rulesRow = getRules();
        if (!rulesRow) return;

        const rules = rulesRow.rules.split("|");
        const askedRule = rules[index];

        if (!askedRule) {
            return msg.channel.send(__("no_rules_defined_at_this_index") + " <:kirinopout:698923065773522944>")
        }

        const Discord = require("discord.js");
        const emb = new Discord.MessageEmbed()
            .addField(__("rule_title") + (index + 1), askedRule)
            .setColor("#000000");
            
        emb.setFooter(__("rules_from") + msg.guild.name, msg.guild.iconURL());
        msg.channel.send(emb);

        function getRules(verbose = true) {
            const rulesRequest = db.prepare("SELECT * FROM rules WHERE id = ?");
            const rulesRow = rulesRequest.get(msg.guild.id);
    
            if (!rulesRow) {
                if (verbose) {
                    msg.channel.send(__("no_rules_defined_on_this_server"));
                }
                return undefined;
            }
    
            return rulesRow;
        }
    }
};