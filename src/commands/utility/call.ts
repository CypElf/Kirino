import { SlashCommandBuilder, ChatInputCommandInteraction, Message, AttachmentBuilder, MessageReaction, ReactionManager, TextBasedChannel, TextChannel, ChannelType, PermissionFlagsBits, GuildMember } from "discord.js"
import i18next from "i18next"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import { KirinoCommand, Kirino } from "../../lib/misc/types"
import { denied, error, success, what } from "../../lib/misc/format"
import { Database } from "better-sqlite3"
import { Call } from "../../lib/misc/database"
import splitMessage from "../../lib/misc/split_message"
import { t } from "../../lib/misc/i18n"

dayjs.extend(utc)

export const command: KirinoCommand = {
    builder: new SlashCommandBuilder()
        .setName("call")
        .setDescription("Start a call or configure the calls settings")
        .addSubcommand(option => option.setName("start").setDescription("Start a new call").addNumberOption(option => option.setName("duration").setDescription("The duration of the call").setRequired(true)))
        .addSubcommandGroup(option => option.setName("channel").setDescription("Manage the channel in which the call result will be sent").addSubcommand(option => option.setName("get").setDescription("Display the currently set channel in which the calls results will be sent")).addSubcommand(option => option.setName("set").setDescription("Change the channel in which the calls results will be sent (need the manage guild permission)").addChannelOption(option => option.setName("channel").setDescription("The new channel in which to send the calls results").setRequired(true))).addSubcommand(option => option.setName("dm").setDescription("Set the channel in which the calls results will be to the user's DM (need the manage guild permission)")).addSubcommand(option => option.setName("reset").setDescription("Restore the default behavior where the results are sent in the same channel as the call itself (need the manage guild permission)")))
        .addSubcommand(option => option.setName("asfile").setDescription("Enable or disable if the calls results are sent as plain text or as a text file in an attachment (need the manage guild permission)").addBooleanOption(option => option.setName("as_file").setDescription("Whether to send the file as plain text or as a text file in an attachment").setRequired(true)))
        .setDMPermission(false),

    async execute(bot: Kirino, interaction: ChatInputCommandInteraction) {
        if (!interaction.guild) return
        const member = interaction.member as GuildMember | null
        const subcommand = interaction.options.getSubcommand()
        const subcommandGroup = interaction.options.getSubcommandGroup(false)

        if (subcommand !== "start" && subcommand !== "get" && !member?.permissions.has(PermissionFlagsBits.ManageGuild)) return interaction.reply({ content: denied(t("not_enough_permissions_to_use_presence")), ephemeral: true })

        if (subcommand === "asfile") {
            const newAsFile = interaction.options.getBoolean("as_file")

            bot.db.prepare("INSERT INTO calls VALUES(?,?,?,?) ON CONFLICT(guild_id) DO UPDATE SET asfile = excluded.asfile").run(interaction.guild.id, null, 0, newAsFile ? 1 : 0)
            deleteRowIfEmpty(bot.db, interaction.guild.id)

            interaction.reply(newAsFile ? t("asfile_success_on") : t("asfile_success_off"))
        }

        else if (subcommandGroup == "channel") {
            if (subcommand === "get") {
                const row = bot.db.prepare("SELECT channel_id, dm FROM calls WHERE guild_id = ?").get(interaction.guild.id) as Call ?? { channel_id: null, dm: 0, asfile: 0 }
                const current = row.channel_id === null && !row.dm

                if (row.dm) interaction.reply(success(t("presence_channel_is_set_to_dm")))
                else if (current) interaction.reply(success(t("presence_channel_is_set_to_current")))
                else {
                    const channels = [...interaction.guild.channels.cache.values()].filter(channel => channel.id === row.channel_id)
                    if (channels.length > 0) interaction.reply(success(`${t("presence_channel_is_set_to_channel")} <#${row.channel_id}>.`))
                    else {
                        bot.db.prepare("UPDATE calls SET channel_id = ? WHERE guild_id = ?").run(null, interaction.guild.id)
                        deleteRowIfEmpty(bot.db, interaction.guild.id)
                        interaction.reply(error(t("presence_channel_outdated")))
                    }
                }
            }

            else {
                const presenceRequest = bot.db.prepare("INSERT INTO calls VALUES(?,?,?,?) ON CONFLICT(guild_id) DO UPDATE SET channel_id = excluded.channel_id, dm = excluded.dm, asfile = excluded.asfile")

                const { asfile } = bot.db.prepare("SELECT * FROM calls WHERE guild_id = ?").get(interaction.guild.id) as Call ?? { asfile: 0 }

                if (subcommand === "set") {
                    const channel = interaction.options.getChannel("channel")
                    if (channel && channel.type !== ChannelType.GuildText) return interaction.reply({ content: error(t("not_a_text_channel")), ephemeral: true })

                    presenceRequest.run(interaction.guild.id, channel?.id, 0, asfile)
                    interaction.reply(success(`${t("presence_channel_set")} <#${channel?.id}>.`))
                }
                else if (subcommand === "reset") {
                    presenceRequest.run(interaction.guild.id, null, 0, asfile)
                    deleteRowIfEmpty(bot.db, interaction.guild.id)
                    interaction.reply(success(t("i_will_send_it_in_current")))
                }
                else if (subcommand === "dm") {
                    presenceRequest.run(interaction.guild.id, null, 1, asfile)
                    interaction.reply(success(t("presence_channel_set_to_dm")))
                }
            }
        }

        else if (subcommand === "start") {
            const duration = Math.round((interaction.options.getNumber("duration") as number + Number.EPSILON) * 100) / 100
            if (duration <= 0 || duration >= 15) return interaction.reply({ content: error(t("duration_out_of_range")), ephemeral: true })

            const row = bot.db.prepare("SELECT channel_id, dm, asfile FROM calls WHERE guild_id = ?").get(interaction.guild.id) as Call | undefined ?? { channel_id: null, dm: false, asfile: false }
            const current = row.channel_id === null && !row.dm

            const lock = bot.calls.get(interaction.guild.id) ?? 0

            if (lock >= 3) return interaction.reply({ content: error(t("records_still_going_on")), ephemeral: true })

            let channel: TextBasedChannel | null
            const channels = [...(await interaction.guild.channels.fetch()).values()].filter(ch => ch?.id === row.channel_id) as TextChannel[]

            if (channels.length > 0 || row.dm || current) {
                bot.calls.set(interaction.guild.id, lock + 1)

                if (row.dm) {
                    channel = interaction.user.dmChannel
                    if (!channel) channel = await interaction.user.createDM()
                }
                else if (current) channel = interaction.channel
                else channel = channels[0]

                if (!channel) return

                const callEmoji = "🙋"

                await interaction.reply(`**${success(t("record_started"))}**\n${t("you_have_x_min_to_react", { count: duration })} ${callEmoji}.`)
                const recordMsg = await interaction.fetchReply() as Message
                recordMsg.react(callEmoji)

                const filter = (reaction: MessageReaction) => reaction.emoji.name === callEmoji

                const languageBak = i18next.language
                const collected = await recordMsg.awaitReactions({ filter, time: 1000 * 60 * duration })

                await i18next.changeLanguage(languageBak)
                i18next.setDefaultNamespace("call") // in case another command changed the namespace while waiting for the reactions

                for (const reaction of [...collected.values()]) {
                    let presents
                    try {
                        presents = await reaction.users.fetch()
                    }
                    catch {
                        return bot.calls.set(interaction.guild.id, bot.calls.get(interaction.guild.id) as number - 1) // happens if the call message is deleted before its end, causing the bot to be unable to get the users who reacted, so we just cancel the call
                    }

                    presents = [...presents.values()].filter(user => !user.bot)

                    let members = []
                    for (const user of presents) {
                        const mem = await interaction.guild.members.fetch(user)
                        if (mem !== null) members.push(mem)
                        else console.error(`Ignored user ${user.tag} for a call because fetching it as a member returned null`)
                    }

                    members = members.map(mem => {
                        let txt = `- ${mem.user.username}`
                        if (mem.nickname) txt += ` (${mem.nickname})`
                        return txt
                    })

                    const msg = await interaction.fetchReply()
                    const reactions = msg.reactions as ReactionManager | undefined
                    if (reactions) reactions.removeAll()

                    interaction.editReply(success(`**${t("record_ended")}**`))

                    let result = `${row.asfile ? "" : "**"}${t("record_from_call", { username: interaction.user.username })}${row.asfile ? "" : "**"} ${row.asfile ? `(${dayjs.utc().format("HH:mm:ss DD/MM/YYYY")} UTC)` : ""} :\n`
                    if (members.length === 0) result += t("nobody")
                    else {
                        result += members.join("\n")
                    }

                    const resultArray = row.asfile ? [result] : splitMessage(result)

                    for (const chunk of resultArray) {
                        try {
                            if (row.asfile) {
                                await channel.send({ files: [new AttachmentBuilder(Buffer.from(chunk, "utf-8"), { name: "record.txt" })] })
                            }
                            else await channel.send(chunk)
                        }
                        catch {
                            let errorMsg = ""
                            if (row.dm) errorMsg += what(t("presence_dm_disabled"))
                            else {
                                errorMsg += what(t("presence_channel_deleted_during_call"))
                                bot.db.prepare("UPDATE calls SET channel_id = ? WHERE guild_id = ?").run(null, interaction.guild.id) // if the channel has been deleted during the call, it cannot be valid anymore in the future
                                deleteRowIfEmpty(bot.db, interaction.guild.id)
                            }
                            interaction.channel?.send(`${errorMsg}\n${t("so_i_will_send_it_here")}`)

                            if (row.asfile) {
                                await interaction.channel?.send({ files: [new AttachmentBuilder(Buffer.from(chunk, "utf-8"), { name: "record.txt" })] })
                            }
                            else await interaction.channel?.send(chunk)
                        }
                    }
                }

                bot.calls.set(interaction.guild.id, bot.calls.get(interaction.guild.id) as number - 1)
            }
            else {
                bot.db.prepare("UPDATE calls SET channel_id = ? WHERE guild_id = ?").run(null, interaction.guild.id)
                deleteRowIfEmpty(bot.db, interaction.guild.id)
                interaction.reply({ content: what(t("presence_channel_not_found")), ephemeral: true })
            }
        }
    }
}

function deleteRowIfEmpty(db: Database, guild_id: string) {
    const row = db.prepare("SELECT * FROM calls WHERE guild_id = ?").get(guild_id) as Call | undefined
    if (row && !row.channel_id && !row.dm && !row.asfile) db.prepare("DELETE FROM calls WHERE guild_id = ?").run(guild_id)
}