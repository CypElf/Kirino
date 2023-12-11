import { SlashCommandBuilder } from "@discordjs/builders"
import { ChatInputCommandInteraction, GuildMember, PermissionFlagsBits, EmbedBuilder } from "discord.js"
import i18next from "i18next"
import { KirinoCommand, Kirino } from "../../lib/misc/types"
import { Rule } from "../../lib/misc/database"
import { denied, error } from "../../lib/misc/format"

const t = i18next.t.bind(i18next)

export const command: KirinoCommand = {
    builder: new SlashCommandBuilder()
        .setName("rule")
        .setDescription("Manage the rules of the server")
        .addSubcommand(option => option.setName("get").setDescription("Display a rule").addIntegerOption(option => option.setName("rule_number").setDescription("The number of the rule you want to display").setRequired(true)))
        .addSubcommand(option => option.setName("count").setDescription("Tell you how many rules are currently registered in the server"))
        .addSubcommand(option => option.setName("add").setDescription("Add a rule to the server").addStringOption(option => option.setName("rule").setDescription("The rule to add to the server").setRequired(true)))
        .addSubcommand(option => option.setName("remove").setDescription("Remove a rule from the server").addIntegerOption(option => option.setName("rule_number").setDescription("The number of the rule to remove from the server").setRequired(true)))
        .setDMPermission(false),
    permissions: ["{manage guild}"],

    async execute(bot: Kirino, interaction: ChatInputCommandInteraction) {
        const subcommand = interaction.options.getSubcommand()
        const member = interaction.member as GuildMember | null

        // ------------------------------------------------------------------- add

        if (subcommand === "add") {
            const rule = interaction.options.getString("rule") as string

            if (member && !member.permissions.has(PermissionFlagsBits.ManageGuild)) return interaction.reply({ content: denied(t("not_enough_permissions_to_add_rule")), ephemeral: true })

            if (rule.length > 1000) return interaction.reply({ content: error(t("rule_too_long")), ephemeral: true })

            const rulesCount = bot.db.prepare("SELECT * FROM rules WHERE guild_id = ?").all(interaction.guild?.id).length
            if (rulesCount >= 30) return interaction.reply({ content: error(t("max_rules_number_reached")), ephemeral: true })

            bot.db.prepare("INSERT INTO rules(guild_id, rule) VALUES(?,?)").run(interaction.guild?.id, rule)

            interaction.reply(`${t("the_following_rule")}\n\`\`\`${rule}\`\`\`\n${t("has_been_added_to_rules")}`)
        }

        // ------------------------------------------------------------------- remove

        else if (subcommand === "remove") {
            if (member && !member.permissions.has(PermissionFlagsBits.ManageGuild)) return interaction.reply({ content: denied(t("not_enough_permissions_to_add_rule")), ephemeral: true })

            const index = interaction.options.getInteger("rule_number") as number - 1

            const rows = bot.db.prepare("SELECT * FROM rules WHERE guild_id = ?").all(interaction.guild?.id) as Rule[]
            if (rows.length === 0) return interaction.reply({ content: t("no_rules_defined_on_this_server"), ephemeral: true })

            if (index < 0 || index >= rows.length) return interaction.reply({ content: error(t("no_rules_defined_at_this_index")), ephemeral: true })

            rows.splice(index, 1)
            bot.db.prepare("DELETE FROM rules WHERE guild_id = ?").run(interaction.guild?.id)

            if (rows.length > 0) {
                for (const rule of rows.map(row => row.rule)) {
                    bot.db.prepare("INSERT INTO rules(guild_id, rule) VALUES(?,?)").run(interaction.guild?.id, rule)
                }
            }

            interaction.reply(`${t("the_rule_number_n")} ${index + 1} ${t("has_been_deleted_from_rules")}`)
        }

        // ------------------------------------------------------------------- count

        else if (subcommand === "count") {
            const count = bot.db.prepare("SELECT * FROM rules WHERE guild_id = ?").all(interaction.guild?.id).length
            interaction.reply(`${t("rules_count", { rules_count: count, count })}`)
        }

        // ------------------------------------------------------------------- display rule

        else if (subcommand === "get") {
            const index = interaction.options.getInteger("rule_number") as number - 1

            const rows = bot.db.prepare("SELECT * FROM rules WHERE guild_id = ?").all(interaction.guild?.id) as Rule[]

            if (rows.length === 0) return interaction.reply({ content: t("no_rules_defined_on_this_server"), ephemeral: true })
            if (index < 0 || index >= rows.length) return interaction.reply({ content: error(t("no_rules_defined_at_this_index")), ephemeral: true })

            const row = rows[index]

            const ruleEmbed = new EmbedBuilder()
                .addFields({ name: t("rule_title") + (index + 1), value: row.rule })
                .setColor("#000000")
                .setFooter({ text: t("rules_from") + interaction.guild?.name, iconURL: interaction.guild?.iconURL()?.toString() })

            interaction.reply({ embeds: [ruleEmbed] })
        }
    }
}