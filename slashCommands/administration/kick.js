const { SlashCommandBuilder } = require("@discordjs/builders")
const { Permissions } = require("discord.js")

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
            return interaction.reply({ content: `${__("you_are_missing_permissions_to_kick_members")} ${__("kirino_pff")}`, ephemeral: true })
        }

        if (!interaction.guild.me.permissions.has(Permissions.FLAGS.KICK_MEMBERS)) {
            return interaction.reply({ content: `${__("i_am_missing_permissions_to_kick_members")} ${__("kirino_pout")}`, ephemeral: true })
        }

        const user = interaction.options.getUser("user")
        const reason = interaction.options.getString("reason") ?? __("no_kick_reason")

        try {
            const member = await interaction.guild.members.fetch(user.id)

            if (!member.kickable) {
                return interaction.reply({ content: `${__("unable_to_kick_higher_than_me")} ${__("kirino_pout")}`, ephemeral: true })
            }

            if (member.id === interaction.member.id) {
                return interaction.reply({ content: `${__("cannot_kick_yourself")} ${__("kirino_pff")}`, ephemeral: true })
            }

            if (interaction.member.roles.highest.comparePositionTo(member.roles.highest) < 0) {
                return interaction.reply({ content: `${__("you_cannot_kick_this_member")} ${__("kirino_pff")}`, ephemeral: true })
            }

            await member.kick({ reason: `${reason} (${__("kicked_by")} ${interaction.user.tag})` })

            interaction.reply(`${user.username + __("has_been_kicked")} <:boot:568041855523094549>`)
        }
        catch {
            interaction.reply({ content: `${__("user_not_on_server")} ${__("kirino_pout")}`, ephemeral: true })
        }
    }
}