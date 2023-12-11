import { SlashCommandBuilder, Channel, ChannelType, ChatInputCommandInteraction, GuildMember, PermissionFlagsBits } from "discord.js"
import { KirinoCommand, Kirino } from "../../lib/misc/types"
import { error, success } from "../../lib/misc/format"
import resetLeave from "../../lib/joins_leaves/reset_leave"
import formatJoinLeaveMessage from "../../lib/joins_leaves/format_join_leave_message"
import { JoinLeave } from "../../lib/misc/database"
import { t } from "../../lib/misc/i18n"

export const command: KirinoCommand = {
    builder: new SlashCommandBuilder()
        .setName("leavemsg")
        .setDescription("Define a message to be sent each time a user leaves the server")
        .addSubcommand(option => option.setName("set").setDescription("Change the leave message").addStringOption(option => option.setName("message").setDescription("The new leave message. You can use {user}, {username}, {tag}, {server} and {count} (members count)").setRequired(true)).addChannelOption(option => option.setName("channel").setDescription("The channel where the leave messages will be sent").setRequired(true)))
        .addSubcommand(option => option.setName("reset").setDescription("Remove the leave message"))
        .addSubcommand(option => option.setName("test").setDescription("Test the leave message by sending it here and now as if you just left the server"))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDMPermission(false),

    async execute(bot: Kirino, interaction: ChatInputCommandInteraction) {
        const member = interaction.member as GuildMember | null
        const subcommand = interaction.options.getSubcommand()

        if (subcommand === "reset") {
            if (!resetLeave(bot.db, interaction.guild?.id as string)) return interaction.reply({ content: error(t("already_no_leave_message")), ephemeral: true })

            interaction.reply(success(t("leave_message_reset")))
        }

        else if (subcommand === "test") {
            const leaveRow = bot.db.prepare("SELECT leaves_channel_id, leave_message FROM joins_leaves WHERE guild_id = ?").get(interaction.guild?.id) as JoinLeave

            if (leaveRow) {
                const { leaves_channel_id, leave_message } = leaveRow
                try {
                    if (!leaves_channel_id || !leave_message) throw new Error()

                    await interaction.guild?.channels.fetch(leaves_channel_id) // assert that the channel where the join message should be sent still exists
                    interaction.reply(formatJoinLeaveMessage(leave_message, member as GuildMember))
                }
                catch {
                    resetLeave(bot.db, interaction.guild?.id as string)
                    interaction.reply(success(t("no_leave_message_set")))
                }
            }
            else {
                interaction.reply(success(t("no_leave_message_set")))
            }
        }

        else if (subcommand === "set") {
            const message = interaction.options.getString("message")
            const channel = interaction.options.getChannel("channel") as Channel

            if (channel.type !== ChannelType.GuildText) return interaction.reply({ content: error(t("not_a_text_channel")), ephemeral: true })

            bot.db.prepare("INSERT INTO joins_leaves(guild_id, leaves_channel_id, leave_message) VALUES(?,?,?) ON CONFLICT(guild_id) DO UPDATE SET leaves_channel_id = excluded.leaves_channel_id, leave_message = excluded.leave_message").run(interaction.guild?.id, channel.id, message)

            interaction.reply(success(`${t("leave_message_set")} <#${channel.id}>.`))
        }
    }
}