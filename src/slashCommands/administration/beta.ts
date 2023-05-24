import { SlashCommandBuilder } from "@discordjs/builders"
import { Permissions, MessageButton, MessageActionRow, CommandInteraction, GuildMember, Message, ButtonInteraction } from "discord.js"
import i18next from "i18next"
import { Kirino } from "../../lib/misc/types"

const t = i18next.t.bind(i18next)

export default {
    data: new SlashCommandBuilder()
        .setName("beta")
        .setDescription("Allow you to access the commands that are still in beta phase")
        .addSubcommand(option => option.setName("status").setDescription("Tell you if the beta mode is currently enabled or disabled"))
        .addSubcommand(option => option.setName("enable").setDescription("Enable the beta mode"))
        .addSubcommand(option => option.setName("disable").setDescription("Disable the beta mode")),
    guildOnly: false,
    permissions: ["manage_guild"],

    async execute(bot: Kirino, interaction: CommandInteraction) {
        const id = interaction.guild ? interaction.guild.id : interaction.user.id
        const isBetaEnabled = bot.db.prepare("SELECT * FROM beta WHERE id = ?").get(id) !== undefined

        const subcommand = interaction.options.getSubcommand()

        if (subcommand === "status") {
            if (isBetaEnabled) {
                interaction.reply(`${t("beta_is_enabled")} ${t("common:kirino_glad")}`)
            }
            else {
                interaction.reply(`${t("beta_is_disabled")} ${t("common:kirino_glad")}`)
            }
        }

        else {
            const member = interaction.member as GuildMember | null
            if (interaction.guild && member && !member.permissions.has(Permissions.FLAGS.MANAGE_GUILD)) {
                return interaction.reply({ content: `${t("missing_permissions_to_enable_beta")} ${t("common:kirino_pout")}`, ephemeral: true })
            }

            if (subcommand === "enable") {
                if (isBetaEnabled) {
                    return interaction.reply({ content: `${t("beta_already_enabled")} ${t("common:kirino_glad")}`, ephemeral: true })
                }

                const actionRow = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setCustomId("confirmed")
                            .setLabel(t("enable_anyway"))
                            .setStyle("DANGER"),
                        new MessageButton()
                            .setCustomId("cancelled")
                            .setLabel(t("cancel"))
                            .setStyle("SECONDARY")
                    )

                await interaction.reply({ content: `${t("beta_confirmation")} ${t("common:kirino_what")}`, components: [actionRow] })

                const confirmationMsg = await interaction.fetchReply() as Message

                const localeBackup = i18next.language
                const filter = (i: ButtonInteraction) => {
                    i.deferUpdate()
                    return i.user.id === interaction.user.id && i.customId === "confirmed" || i.customId === "cancelled"
                }

                const collector = confirmationMsg.createMessageComponentCollector({ filter, componentType: "BUTTON", time: 30_000 })

                collector.on("collect", async i => {
                    await i18next.changeLanguage(localeBackup)
                    i18next.setDefaultNamespace("beta")
                    if (i.customId === "confirmed") {
                        bot.db.prepare("INSERT INTO beta VALUES(?)").run(id)
                        interaction.editReply({ content: `${t("beta_enabled")} ${t("common:kirino_glad")}`, components: [] })
                    }
                    else {
                        interaction.editReply({ content: `${t("beta_enabled_cancelled")} ${t("common:kirino_pout")}`, components: [] })
                    }
                })
            }
            else if (subcommand === "disable") {
                if (!isBetaEnabled) {
                    return interaction.reply({ content: `${t("beta_already_disabled")} ${t("common:kirino_glad")}`, ephemeral: true })
                }

                bot.db.prepare("DELETE FROM beta WHERE id = ?").run(id)
                interaction.reply(`${t("beta_disabled")} ${t("common:kirino_glad")}`)
            }
        }
    }
}