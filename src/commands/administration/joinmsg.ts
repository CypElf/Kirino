import { SlashCommandBuilder } from "@discordjs/builders"
import { Channel, CommandInteraction, GuildMember, Permissions } from "discord.js"
import i18next from "i18next"
import resetJoin from "../../lib/joins_leaves/reset_join"
import formatJoinLeaveMessage from "../../lib/joins_leaves/format_join_leave_message"
import { Kirino } from "../../lib/misc/types"
import { success } from "../../lib/misc/format"
import { JoinLeave } from "../../lib/misc/database"

const t = i18next.t.bind(i18next)

export const command = {
    data: new SlashCommandBuilder()
        .setName("joinmsg")
        .setDescription("Define a message to be sent each time a user joins the server")
        .addSubcommand(option => option.setName("set").setDescription("Change the join message").addStringOption(option => option.setName("message").setDescription("The new join message. You can use {user}, {username}, {tag}, {server} and {count} (members count)").setRequired(true)).addChannelOption(option => option.setName("channel").setDescription("The channel where the join messages will be sent").setRequired(true)))
        .addSubcommand(option => option.setName("reset").setDescription("Remove the join message"))
        .addSubcommand(option => option.setName("test").setDescription("Test the join message by sending it here and now as if you just joined the server")),
    guildOnly: true,
    permissions: ["manage_guild"],

    async execute(bot: Kirino, interaction: CommandInteraction) {
        const member = interaction.member as GuildMember | null
        if (member && !member.permissions.has(Permissions.FLAGS.MANAGE_GUILD)) return interaction.reply({ content: `${t("not_allowed_to_use_this_command")} ${t("common:kirino_pff")}`, ephemeral: true })

        const subcommand = interaction.options.getSubcommand()

        if (subcommand === "reset") {
            if (interaction.guild && !resetJoin(bot.db, interaction.guild.id)) return interaction.reply({ content: `${t("already_no_join_message")} ${t("common:kirino_pout")}`, ephemeral: true })

            interaction.reply(success(t("join_message_reset")))
        }

        else if (subcommand === "test") {
            const joinRow = bot.db.prepare("SELECT joins_channel_id, join_message FROM joins_leaves WHERE guild_id = ?").get(interaction.guild?.id) as JoinLeave

            if (joinRow) {
                const { joins_channel_id, join_message } = joinRow
                try {
                    if (!joins_channel_id || !join_message) throw new Error()

                    await interaction.guild?.channels.fetch(joins_channel_id) // assert that the channel where the join message should be sent still exists
                    interaction.reply(formatJoinLeaveMessage(join_message, member as GuildMember))
                }
                catch {
                    if (interaction.guild) resetJoin(bot.db, interaction.guild.id)
                    interaction.reply(success(t("no_join_message_set")))
                }
            }
            else {
                interaction.reply(success(t("no_join_message_set")))
            }
        }

        else if (subcommand === "set") {
            const message = interaction.options.getString("message")
            const channel = interaction.options.getChannel("channel") as Channel

            if (channel && !channel.isText()) return interaction.reply({ content: `${t("not_a_text_channel")} ${t("common:kirino_pout")}`, ephemeral: true })

            bot.db.prepare("INSERT INTO joins_leaves(guild_id, joins_channel_id, join_message) VALUES(?,?,?) ON CONFLICT(guild_id) DO UPDATE SET joins_channel_id=excluded.joins_channel_id, join_message=excluded.join_message").run(interaction.guild?.id, channel.id, message)

            interaction.reply(success(`${t("join_message_set")} <#${channel.id}>.`))
        }
    }
}