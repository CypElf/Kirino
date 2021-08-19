const { SlashCommandBuilder } = require("@discordjs/builders")
const { Permissions } = require("discord.js")
const { __ } = require("i18n")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Ban the specified user")
        .addUserOption(option => option.setName("user").setDescription("The user to ban").setRequired(true))
        .addStringOption(option => option.setName("reason").setDescription("The reason why the user will be banned")),
    guildOnly: true,
    cooldown: 3,
    permissions: ["ban members"],

    async execute(bot, interaction) {
        if (!interaction.member.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
            return interaction.reply({ content: `${__("you_are_missing_permissions_to_ban_members")} ${__("kirino_pff")}`, ephemeral: true })
        }

        if (!interaction.guild.me.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
            return interaction.reply({ content: `${__("i_am_missing_permissions_to_ban_members")} ${__("kirino_pout")}`, ephemeral: true })
        }

        const user = interaction.options.getUser("user")
        const reason = interaction.options.getString("reason") ?? __("no_ban_reason")

        try {
            const member = await interaction.guild.members.fetch(user.id)

            if (!member.bannable) {
                return interaction.reply({ content: `${__("unable_to_ban_higher_than_me")} ${__("kirino_pout")}`, ephemeral: true })
            }

            if (member.id === interaction.member.id) {
                return interaction.reply({ content: `${__("cannot_ban_yourself")} ${__("kirino_pff")}`, ephemeral: true })
            }

            if (interaction.member.roles.highest.comparePositionTo(member.roles.highest) < 0) {
                return interaction.reply({ content: `${__("you_cannot_ban_this_member")} ${__("kirino_pff")}`, ephemeral: true })
            }
        }
        // eslint-disable-next-line no-empty
        catch {}

        interaction.guild.members.ban(user, { reason: `${reason} (${__("banned_by")} ${interaction.user.tag})` })
        interaction.reply(`${user.username + __("has_been_banned")} <:hammer:568068459485855752>`)
    }
}