const { SlashCommandBuilder } = require("@discordjs/builders")
const { Permissions } = require("discord.js")
const resetLeave = require("../../lib/joins_leaves/reset_leave")
const handleMemberRemove = require("../../lib/joins_leaves/handle_member_remove")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("leavemsg")
        .setDescription("Define a message to be sent each time a user leaves the server")
        .addSubcommand(option => option.setName("set").setDescription("Change the leave message").addStringOption(option => option.setName("message").setDescription("The new leave message. You can use {user}, {username}, {tag}, {server} and {count} (members count)").setRequired(true)).addChannelOption(option => option.setName("channel").setDescription("The channel where the leave messages will be sent").setRequired(true)))
        .addSubcommand(option => option.setName("reset").setDescription("Remove the leave message"))
        .addSubcommand(option => option.setName("test").setDescription("Test the leave message by sending it here and now as if you just left the server")),
    guildOnly: true,
    permissions: ["manage_guild"],

    async execute(bot, interaction) {
        if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_GUILD)) return interaction.reply({ content: `${__("not_allowed_to_use_this_command")} ${__("kirino_pff")}`, ephemeral: true })

        const subcommand = interaction.options.getSubcommand()

        if (subcommand === "reset") {
            if (!resetLeave(bot.db, interaction.guild.id)) return interaction.reply({ content: `${__("already_no_leave_message")} ${__("kirino_pout")}`, ephemeral: true })

            interaction.reply(`${__("leave_message_reset")} ${__("kirino_glad")}`)
        }

        else if (subcommand === "test") {
            if (handleMemberRemove(bot.db, interaction.member, interaction.channelId)) interaction.reply({ content: `${__("leave_test_sent")} ${__("kirino_glad")}`, ephemeral: true })
            else interaction.reply(`${__("no_leave_message_set")} ${__("kirino_glad")}`)
        }

        else if (subcommand === "set") {
            const message = interaction.options.getString("message")
            const channel = interaction.options.getChannel("channel")

            if (!channel.isText()) return interaction.reply({ content: `${__("not_a_text_channel")} ${__("kirino_pout")}`, ephemeral: true })

            bot.db.prepare("INSERT INTO joins_leaves(guild_id, leaves_channel_id, leave_message) VALUES(?,?,?) ON CONFLICT(guild_id) DO UPDATE SET leaves_channel_id = excluded.leaves_channel_id, leave_message = excluded.leave_message").run(interaction.guild.id, channel.id, message)

            interaction.reply(`${__("leave_message_set")} <#${channel.id}>. ${__("kirino_glad")}`)
        }
    }
}