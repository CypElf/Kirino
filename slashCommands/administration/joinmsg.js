const { SlashCommandBuilder } = require("@discordjs/builders")
const { Permissions } = require("discord.js")
const resetJoin = require("../../lib/joins_leaves/reset_join")
const handleMemberAdd = require("../../lib/joins_leaves/handle_member_add")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("joinmsg")
        .setDescription("Define a message to be sent each time a user joins the server")
        .addSubcommand(option => option.setName("set").setDescription("Change the join message").addStringOption(option => option.setName("message").setDescription("The new join message. You can use {user}, {username}, {tag}, {server} and {count} (members count)").setRequired(true)).addChannelOption(option => option.setName("channel").setDescription("The channel where the join messages will be sent").setRequired(true)))
        .addSubcommand(option => option.setName("reset").setDescription("Remove the join message"))
        .addSubcommand(option => option.setName("test").setDescription("Test the join message by sending it here and now as if you just joined the server")),
    guildOnly: true,
    permissions: ["manage_guild"],

    async execute(bot, interaction) {
        if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_GUILD)) return interaction.reply({ content: `${__("not_allowed_to_use_this_command")} ${__("kirino_pff")}`, ephemeral: true })

        const subcommand = interaction.options.getSubcommand()

        if (subcommand === "reset") {
            if (!resetJoin(bot.db, interaction.guild.id)) return interaction.reply({ content: `${__("already_no_join_message")} ${__("kirino_pout")}`, ephemeral: true })

            interaction.reply(`${__("join_message_reset")} ${__("kirino_glad")}`)
        }

        else if (subcommand === "test") {
            if (handleMemberAdd(bot.db, interaction.member, interaction.channelId)) interaction.reply({ content: `${__("join_test_sent")} ${__("kirino_glad")}`, ephemeral: true })
            else interaction.reply(`${__("no_join_message_set")} ${__("kirino_glad")}`)
        }

        else if (subcommand === "set") {
            const message = interaction.options.getString("message")
            const channel = interaction.options.getChannel("channel")

            if (!channel.isText()) return interaction.reply({ content: `${__("not_a_text_channel")} ${__("kirino_pout")}`, ephemeral: true })

            bot.db.prepare("INSERT INTO joins_leaves(guild_id, joins_channel_id, join_message) VALUES(?,?,?) ON CONFLICT(guild_id) DO UPDATE SET joins_channel_id=excluded.joins_channel_id, join_message=excluded.join_message").run(interaction.guild.id, channel.id, message)

            interaction.reply(`${__("join_message_set")} <#${channel.id}>. ${__("kirino_glad")}`)
        }
    }
}