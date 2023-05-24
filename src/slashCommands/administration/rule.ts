const { SlashCommandBuilder } = require("@discordjs/builders")
const { Permissions, MessageEmbed } = require("discord.js")
const t = require("i18next").t.bind(require("i18next"))

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rule")
        .setDescription("Manage the rules of the server")
        .addSubcommand(option => option.setName("get").setDescription("Display a rule").addIntegerOption(option => option.setName("rule_number").setDescription("The number of the rule you want to display").setRequired(true)))
        .addSubcommand(option => option.setName("count").setDescription("Tell you how many rules are currently registered in the server"))
        .addSubcommand(option => option.setName("add").setDescription("Add a rule to the server").addStringOption(option => option.setName("rule").setDescription("The rule to add to the server").setRequired(true)))
        .addSubcommand(option => option.setName("remove").setDescription("Remove a rule from the server").addIntegerOption(option => option.setName("rule_number").setDescription("The number of the rule to remove from the server").setRequired(true))),
    guildOnly: true,
    permissions: ["{manage guild}"],

    async execute(bot, interaction) {
        const subcommand = interaction.options.getSubcommand()

        // ------------------------------------------------------------------- add

        if (subcommand === "add") {
            const rule = interaction.options.getString("rule")

            if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_GUILD)) return interaction.reply({ content: `${t("not_enough_permissions_to_add_rule")} ${t("common:kirino_pff")}`, ephemeral: true })

            if (rule.length > 1000) return interaction.reply({ content: `${t("rule_too_long")} ${t("common:kirino_pout")}`, ephemeral: true })

            const rulesCount = bot.db.prepare("SELECT * FROM rules WHERE guild_id = ?").all(interaction.guild.id).length
            if (rulesCount >= 30) return interaction.reply({ content: `${t("max_rules_number_reached")} ${t("common:kirino_pout")}`, ephemeral: true })

            bot.db.prepare("INSERT INTO rules(guild_id, rule) VALUES(?,?)").run(interaction.guild.id, rule)

            interaction.reply(`${t("the_following_rule")}\n\`\`\`${rule}\`\`\`\n${t("has_been_added_to_rules")}`)
        }

        // ------------------------------------------------------------------- remove

        else if (subcommand === "remove") {
            if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_GUILD)) return interaction.reply({ content: `${t("not_enough_permissions_to_add_rule")} ${t("common:kirino_pff")}`, ephemeral: true })

            const index = interaction.options.getInteger("rule_number") - 1

            const rules = bot.db.prepare("SELECT * FROM rules WHERE guild_id = ?").all(interaction.guild.id).map(row => row.rule)
            if (rules.length === 0) return interaction.reply({ content: t("no_rules_defined_on_this_server"), ephemeral: true })

            if (index < 0 || index >= rules.length) return interaction.reply({ content: `${t("no_rules_defined_at_this_index")} ${t("common:kirino_pout")}`, ephemeral: true })

            rules.splice(index, 1)
            bot.db.prepare("DELETE FROM rules WHERE guild_id = ?").run(interaction.guild.id)

            if (rules.length > 0) {
                for (const rule of rules) {
                    bot.db.prepare("INSERT INTO rules(guild_id, rule) VALUES(?,?)").run(interaction.guild.id, rule)
                }
            }

            interaction.reply(`${t("the_rule_number_n")} ${index + 1} ${t("has_been_deleted_from_rules")}`)
        }

        // ------------------------------------------------------------------- count

        else if (subcommand === "count") {
            const count = bot.db.prepare("SELECT * FROM rules WHERE guild_id = ?").all(interaction.guild.id).length
            interaction.reply(`${t("rules_count", { rules_count: count, count })}`)
        }

        // ------------------------------------------------------------------- display rule

        else if (subcommand === "get") {
            const index = interaction.options.getInteger("rule_number") - 1

            const rules = bot.db.prepare("SELECT * FROM rules WHERE guild_id = ?").all(interaction.guild.id).map(row => row.rule)

            if (rules.length === 0) return interaction.reply({ content: t("no_rules_defined_on_this_server"), ephemeral: true })
            if (index < 0 || index >= rules.length) return interaction.reply({ content: `${t("no_rules_defined_at_this_index")} ${t("common:kirino_pout")}`, ephemeral: true })

            const rule = rules[index]

            const ruleEmbed = new MessageEmbed()
                .addField(t("rule_title") + (index + 1), rule)
                .setColor("#000000")
                .setFooter({ text: t("rules_from") + interaction.guild.name, iconURL: interaction.guild.iconURL() })

            interaction.reply({ embeds: [ruleEmbed] })
        }
    }
}