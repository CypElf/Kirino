const { SlashCommandBuilder } = require("@discordjs/builders")
const { Permissions } = require("discord.js")
const t = require("i18next").t.bind(require("i18next"))

module.exports = {
    data: new SlashCommandBuilder()
        .setName("kick")
        .setDescription("Kick the specified user")
        .addUserOption(option => option.setName("user").setDescription("The user to kick").setRequired(true))
        .addStringOption(option => option.setName("reason").setDescription("The reason why the user will be kick")),
    guildOnly: true,
    cooldown: 3,
    permissions: ["kick members"],

    async execute(bot, interaction) {
        if (!interaction.member.permissions.has(Permissions.FLAGS.KICK_MEMBERS)) {
            return interaction.reply({ content: `${t("you_are_missing_permissions_to_kick_members")} ${t("common:kirino_pff")}`, ephemeral: true })
        }

        if (!interaction.guild.me.permissions.has(Permissions.FLAGS.KICK_MEMBERS)) {
            return interaction.reply({ content: `${t("i_am_missing_permissions_to_kick_members")} ${t("common:kirino_pout")}`, ephemeral: true })
        }

        const user = interaction.options.getUser("user")
        const reason = interaction.options.getString("reason") ?? t("no_kick_reason")

        try {
            const member = await interaction.guild.members.fetch(user.id)

            if (!member.kickable) {
                return interaction.reply({ content: `${t("unable_to_kick_higher_than_me")} ${t("common:kirino_pout")}`, ephemeral: true })
            }

            if (member.id === interaction.member.id) {
                return interaction.reply({ content: `${t("cannot_kick_yourself")} ${t("common:kirino_pff")}`, ephemeral: true })
            }

            if (interaction.member.roles.highest.comparePositionTo(member.roles.highest) < 0) {
                return interaction.reply({ content: `${t("you_cannot_kick_this_member")} ${t("common:kirino_pff")}`, ephemeral: true })
            }

            await member.kick({ reason: `${reason} (${t("kicked_by")} ${interaction.user.tag})` })

            interaction.reply(`${user.username + t("has_been_kicked")} <:boot:568041855523094549>`)
        }
        catch {
            interaction.reply({ content: `${t("user_not_on_server")} ${t("common:kirino_pout")}`, ephemeral: true })
        }
    }
}