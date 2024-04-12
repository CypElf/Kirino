import { SlashCommandBuilder, ChatInputCommandInteraction, ChannelType, EmbedBuilder, GuildMember, PermissionsBitField, TextChannel } from "discord.js"
import dayjs from "dayjs"
import customParseFormat from "dayjs/plugin/customParseFormat"
import { KirinoCommand, Kirino } from "../../lib/misc/types"
import { Birthday, BirthdayMetadata } from "../../lib/misc/database"
import { error, success, denied, what } from "../../lib/misc/format"
import { t } from "../../lib/misc/i18n"
import { scheduleBirthday } from "../../lib/birthday/schedule"

dayjs.extend(customParseFormat)

export const command: KirinoCommand = {
    builder: new SlashCommandBuilder()
        .setName("birthday")
        .setDescription("Manage the birthday system")
        .addSubcommand(subcommand => subcommand.setName("enable").setDescription("Enable the birthday system in this server (require the manage server permission)").addChannelOption(option => option.setName("birthday_channel").setDescription("The channel where the birthday messages will be sent").setRequired(true)))
        .addSubcommand(subcommand => subcommand.setName("disable").setDescription("Disable the birthday system in this server (require the manage server permission)"))
        .addSubcommand(subcommand => subcommand.setName("set").setDescription("Set your birthday globally").addStringOption(option => option.setName("birthday").setDescription("Your birthday, format DD/MM").setRequired(true)))
        .addSubcommand(subcommand => subcommand.setName("unset").setDescription("Unset your birthday globally"))
        .addSubcommand(subcommand => subcommand.setName("list").setDescription("List all the birthdays in this server"))
        .addSubcommandGroup(group => group.setName("message").setDescription("Manage the birthday message").addSubcommand(subcommand => subcommand.setName("set").setDescription("Set the birthday message (require the manage server permission)").addStringOption(option => option.setName("message").setDescription("The birthday message. You can use {username} and {mention}").setRequired(true))).addSubcommand(subcommand => subcommand.setName("reset").setDescription("Reset the birthday message (require the manage server permission)")))
        .setDMPermission(false),

    async execute(bot: Kirino, interaction: ChatInputCommandInteraction) {
        const subcommandGroup = interaction.options.getSubcommandGroup()
        const subcommand = interaction.options.getSubcommand()

        const serverMetadata = bot.db.prepare("SELECT * FROM birthdays_metadata WHERE guild_id = ?").get(interaction.guild?.id) as BirthdayMetadata | undefined
        const canUserManageGuild = (interaction.member as GuildMember).permissions.has(PermissionsBitField.Flags.ManageGuild)

        if (subcommandGroup === "message") {
            if (!canUserManageGuild) {
                return interaction.reply({ content: denied(t("permissions_missing")), ephemeral: true })
            }

            if (!serverMetadata?.enabled) {
                return interaction.reply({ content: error(t("enable_needed_first")), ephemeral: true })
            }

            if (subcommand === "set") {
                const message = interaction.options.getString("message", true)
                bot.db.prepare("UPDATE birthdays_metadata SET message = ? WHERE guild_id = ?").run(message, interaction.guild?.id)
                return interaction.reply(success(t("message_set")))
            }
            else {
                if (!serverMetadata?.message) {
                    return interaction.reply({ content: error(t("already_no_message_set")), ephemeral: true })
                }

                bot.db.prepare("UPDATE birthdays_metadata SET message = NULL WHERE guild_id = ?").run(interaction.guild?.id)
                return interaction.reply(success(t("message_reset")))
            }
        }

        else if (subcommand === "enable" || subcommand === "disable") {
            if (!canUserManageGuild) {
                return interaction.reply({ content: denied(t("permissions_missing")), ephemeral: true })
            }

            const updateStatusReq = bot.db.prepare("INSERT INTO birthdays_metadata(guild_id, enabled, channel_id) VALUES(?,?,?) ON CONFLICT(guild_id) DO UPDATE SET enabled = ?, channel_id = ?")

            if (subcommand === "enable") {
                if (serverMetadata?.enabled) {
                    return interaction.reply({ content: error(t("already_enabled")), ephemeral: true })
                }

                const channel = interaction.options.getChannel("birthday_channel", true)
                if (channel.type !== ChannelType.GuildText || !(channel as TextChannel).viewable) return interaction.reply({ content: error(t("bad_channel")), ephemeral: true })

                updateStatusReq.run(interaction.guild?.id, 1, channel.id, 1, channel.id)
                return interaction.reply(success(t("enabled")))
            }
            else {
                if (!serverMetadata?.enabled) {
                    return interaction.reply({ content: error(t("already_disabled")), ephemeral: true })
                }

                if (!serverMetadata?.message) {
                    // if a message is not set, the row does not contain any useful information anymore, so we can delete it
                    bot.db.prepare("DELETE FROM birthdays_metadata WHERE guild_id = ?").run(interaction.guild?.id)
                }
                else {
                    updateStatusReq.run(interaction.guild?.id, 0, null, 0, null)
                }
                return interaction.reply(success(t("disabled")))
            }
        }

        else if (subcommand === "set") {
            const birthday = interaction.options.getString("birthday", true)

            // 2000 is used here just as an arbitrary leap year to allow the 29th of February to be accepted
            if (!dayjs(`${birthday}/2000`, "DD/MM/YYYY", true).isValid()) {
                return interaction.reply({ content: error(t("invalid_date")), ephemeral: true })
            }

            bot.db.prepare("INSERT INTO birthdays(user_id, birthday) VALUES(?,?) ON CONFLICT(user_id) DO UPDATE SET birthday = ?").run(interaction.user.id, birthday, birthday)

            if (bot.birthdaysJobs.has(interaction.user.id)) {
                bot.birthdaysJobs.get(interaction.user.id)?.cancel()
                bot.birthdaysJobs.delete(interaction.user.id)
            }

            const job = scheduleBirthday(bot, interaction.user.id, parseInt(birthday.split("/")[0]), parseInt(birthday.split("/")[1]))
            bot.birthdaysJobs.set(interaction.user.id, job)
            return interaction.reply(success(t("birthday_set", { birthday })))
        }

        else if (subcommand === "unset") {
            if (!bot.db.prepare("SELECT * FROM birthdays WHERE user_id = ?").get(interaction.user.id)) {
                return interaction.reply({ content: error(t("no_birthday_set")), ephemeral: true })
            }

            bot.birthdaysJobs.get(interaction.user.id)?.cancel()
            bot.birthdaysJobs.delete(interaction.user.id)

            bot.db.prepare("DELETE FROM birthdays WHERE user_id = ?").run(interaction.user.id)
            return interaction.reply(success(t("birthday_unset")))
        }

        else if (subcommand === "list") {
            const registeredUsers = bot.db.prepare("SELECT * FROM birthdays").all() as Birthday[]
            const registeredUsersIDs = registeredUsers.map(u => u.user_id)
            const members = await interaction.guild?.members.fetch()

            const serverRegistered: { member: GuildMember, birthday: string }[] = []

            if (members) {
                for (const member of [...members.values()].filter(m => registeredUsersIDs.includes(m.user.id))) {
                    serverRegistered.push({ member, birthday: registeredUsers.find(u => u.user_id === member.user.id)?.birthday as string })
                }
            }

            const fields = []
            const months = [t("january"), t("february"), t("march"), t("april"), t("may"), t("june"), t("july"), t("august"), t("september"), t("october"), t("november"), t("december")]

            for (const [i, month] of months.entries()) {
                const monthNumber = (i + 1).toString().padStart(2, "0")
                const monthUsers = serverRegistered.filter(u => u.birthday.split("/")[1] === monthNumber).sort((userA, userB) => parseInt(userA.birthday.split("/")[0]) - parseInt(userB.birthday.split("/")[0]))
                const formattedUsers = monthUsers.map(u => `**${u.member.user.tag}** - ${u.birthday}`).join("\n")

                fields.push({ name: month, value: formattedUsers.length > 0 ? formattedUsers : t("no_birthdays"), inline: true })

                // add a blank field between each block of two, in order to get two columns inline instead of three in the embed
                if (i % 2 === 1) {
                    fields.push({ name: "\t", value: "\t" })
                }
            }

            if (serverRegistered.length === 0) {
                return interaction.reply(what(t("zero_birthday_found")))
            }
            else {
                const listEmbed = new EmbedBuilder()
                    .setTitle(t("birthdays"))
                    .addFields(...fields)
                    .setFooter({ text: t("common:request_from", { username: interaction.user.username }), iconURL: interaction.user.displayAvatarURL() })
                    .setThumbnail("https://cdn.discordapp.com/attachments/714381484617891980/1228003702950985840/birthday.png")

                interaction.reply({ embeds: [listEmbed] })
            }
        }
    }
}