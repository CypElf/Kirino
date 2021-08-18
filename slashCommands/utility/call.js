const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("call")
        .setDescription("Start a call of configure the calls settings")
        .addSubcommand(option => option.setName("start").setDescription("Start a new call").addIntegerOption(option => option.setName("duration").setDescription("The duration of the call").setRequired(true))) // TODO : replace addIntegerOption by addNumberOption once available
        .addSubcommandGroup(option => option.setName("channel").setDescription("Manage the channel in which the call result will be sent").addSubcommand(option => option.setName("get").setDescription("Display the currently set channel in which the calls results will be sent")).addSubcommand(option => option.setName("set").setDescription("Change the channel in which the calls results will be sent").addChannelOption(option => option.setName("channel").setDescription("The new channel in which to send the calls results").setRequired(true))).addSubcommand(option => option.setName("dm").setDescription("Set the channel in which the calls results will be to the user's DM")).addSubcommand(option => option.setName("reset").setDescription("Restore the default behavior where the results are sent in the same channel as the call itself")))
        .addSubcommand(option => option.setName("asfile").setDescription("Enable or disable if the calls results are sent as plain text or as a text file in an attachment").addBooleanOption(option => option.setName("as_file").setDescription("Whether to send the file as plain text or as a text file in an attachment").setRequired(true))),
    guildOnly: true,
    permissions: ["manage_channels", "manage_guild or manage_messages"],

    async execute(bot, interaction) {
        const { MessageAttachment, Permissions } = require("discord.js")
        const formatDate = require("../../lib/misc/format_date")

        if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS) && !interaction.member.permissions.has(Permissions.FLAGS.MANAGE_GUILD) && !interaction.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES) && (mode !== "channel" || args[1] !== undefined)) return interaction.reply({ content: `${__("not_enough_permissions_to_use_presence")} ${__("kirino_pff")}`, ephemeral: true })

        const subcommand = interaction.options.getSubcommand()
        const subcommandGroup = interaction.options.getSubcommandGroup(false)

        if (subcommand === "asfile") {
            const newAsFile = interaction.options.getBoolean("as_file")

            bot.db.prepare("INSERT INTO calls VALUES(?,?,?,?) ON CONFLICT(guild_id) DO UPDATE SET asfile = excluded.asfile").run(interaction.guild.id, null, 0, newAsFile ? 1 : 0)
            deleteRowIfEmpty(bot.db, interaction.guild.id)

            interaction.reply(newAsFile ? __("asfile_success_on") : __("asfile_success_off"))
        }

        else if (subcommandGroup == "channel") {
            if (subcommand === "get") {
                const row = bot.db.prepare("SELECT channel_id, dm FROM calls WHERE guild_id = ?").get(interaction.guild.id) ?? { channel_id: null, dm: 0, asfile: 0 }
                const current = row.channel_id === null && row.dm === 0

                if (row.dm) interaction.reply(`${__("presence_channel_is_set_to_dm")} ${__("kirino_glad")}`)
                else if (current) interaction.reply(`${__("presence_channel_is_set_to_current")} ${__("kirino_glad")}`)
                else {
                    const channels = [...interaction.guild.channels.cache.values()].filter(channel => channel.id === row.channel_id)
                    if (channels.length > 0) interaction.reply(`${__("presence_channel_is_set_to_channel")} <#${row.channel_id}>. ${__("kirino_glad")}`)
                    else {
                        bot.db.prepare("UPDATE calls SET channel_id = ? WHERE guild_id = ?").run(null, interaction.guild.id)
                        deleteRowIfEmpty(bot.db, interaction.guild.id)
                        interaction.reply(`${__("presence_channel_outdated")} ${__("kirino_pout")}`)
                    }
                }
            }

            else {
                const presenceRequest = bot.db.prepare("INSERT INTO calls VALUES(?,?,?,?) ON CONFLICT(guild_id) DO UPDATE SET channel_id = excluded.channel_id, dm = excluded.dm, asfile = excluded.asfile")

                const { asfile } = bot.db.prepare("SELECT * FROM calls WHERE guild_id = ?").get(interaction.guild.id) ?? { asfile: 0 }

                if (subcommand === "set") {
                    const channel = interaction.options.getChannel("channel")
                    if (!channel.isText()) return interaction.reply({ content: `${__("not_a_text_channel")} ${__("kirino_pout")}`, ephemeral: true })

                    presenceRequest.run(interaction.guild.id, channel.id, 0, asfile)
                    interaction.reply(`${__("presence_channel_set")} <#${channel.id}>. ${__("kirino_glad")}`)
                }
                else if (subcommand === "reset") {
                    presenceRequest.run(interaction.guild.id, null, 0, asfile)
                    deleteRowIfEmpty(bot.db, interaction.guild.id)
                    interaction.reply(`${__("i_will_send_it_in_current")} ${__("kirino_glad")}`)
                }
                else if (subcommand === "dm") {
                    presenceRequest.run(interaction.guild.id, null, 1, asfile)
                    interaction.reply(`${__("presence_channel_set_to_dm")} ${__("kirino_glad")}`)
                }
            }
        }

        else if (subcommand === "start") {
            const duration = Math.round((parseFloat(interaction.options.getInteger("duration")) + Number.EPSILON) * 100) / 100 // TODO : change getInteger to getNumber
            if (duration <= 0 || duration >= 15) return interaction.reply({ content: `${__("duration_out_of_range")} ${__("kirino_pout")}`, ephemeral: true })

            const row = bot.db.prepare("SELECT channel_id, dm FROM calls WHERE guild_id = ?").get(interaction.guild.id) ?? { channel_id: null, dm: 0, asfile: 0 }
            const current = row.channel_id === null && row.dm === 0

            const lock = bot.calls.get(interaction.guild.id) ?? 0

            if (lock >= 3) return interaction.reply({ content: `${__("records_still_going_on")} ${__("kirino_pout")}`, ephemeral: true })

            let channel
            const channels = [...await interaction.guild.channels.fetch()].filter(ch => ch.id === row.channel_id)

            if (channels.length > 0 || row.dm || current) {
                bot.calls.set(interaction.guild.id, lock + 1)

                if (row.dm) {
                    channel = interaction.user.dmChannel
                    if (!channel) channel = await interaction.user.createDM()
                }
                else if (current) channel = interaction.channel
                else channel = channels[0]

                await interaction.reply(`**${__("record_started")}** ${__("kirino_glad")}\n${__("you_have")} ${duration} ${__("min_to_raise_the_hand")} 🙋.`)
                const recordMsg = await interaction.fetchReply()
                recordMsg.react("🙋")

                const filter = reaction => reaction.emoji.name === "🙋"

                const languageBak = getLocale()
                const collected = await recordMsg.awaitReactions({ filter, time: 1000 * 60 * duration })
                setLocale(languageBak)

                for (const reaction of [...collected.values()]) {
                    let presents
                    try {
                        presents = await reaction.users.fetch()
                    }
                    catch {
                        return bot.calls.set(interaction.guild.id, bot.calls.get(interaction.guild.id) - 1) // happens if the call message is deleted before its end, causing the bot to be unable to get the users who reacted, so we just cancel the call
                    }

                    presents = [...presents.values()].filter(user => !user.bot)

                    let members = []
                    for (const user of presents) {
                        const member = await interaction.guild.members.fetch(user)
                        if (member !== null) members.push(member)
                        else console.error(`Ignored user ${user.tag} for a call because fetching it as a member returned null`)
                    }

                    members = members.map(member => {
                        let txt = `- ${member.user.username}`
                        if (member.nickname) txt += ` (${member.nickname})`
                        return txt
                    })

                    interaction.followUp(`**${__("record_ended")}** ${__("kirino_glad")}`)

                    const txt = [`${row.asfile ? "" : "**"}${__("record_from")} ${interaction.user.username}${__("s_call")}${row.asfile ? "" : "**"} ${row.asfile ? `(${formatDate(new Date())})` : ""} :\n`]
                    if (members.length === 0) txt[0] += __("nobody")

                    if (row.asfile) txt[0] += members.join("\n")
                    else {
                        let i = 0
                        for (const record of members) {
                            if (txt[i].length + record.length <= 2000) txt[i] += record + "\n"
                            else {
                                i++
                                txt.push("")
                            }
                        }
                    }

                    for (const chunk of txt) {
                        const isFile = row.asfile
                        const content = isFile ? new MessageAttachment(Buffer.from(chunk, "utf-8"), "record.txt") : chunk

                        try {
                            if (current) {
                                if (isFile) await interaction.followUp({ files: [content] })
                                else await interaction.followUp(content)
                            }
                            else if (isFile) await channel.send({ files: [content] })
                            else await channel.send(content)
                        }
                        catch {
                            let errorMsg = ""
                            if (row.dm) errorMsg += `${__("presence_dm_disabled")} ${__("kirino_what")}`
                            else {
                                errorMsg += `${__("presence_channel_deleted_during_call")} ${__("kirino_what")}`
                                bot.db.prepare("UPDATE calls SET channel_id = ? WHERE guild_id = ?").run(null, interaction.guild.id) // if the channel has been deleted during the call, it cannot be valid anymore in the future
                                deleteRowIfEmpty(bot.db, interaction.guild.id)
                            }
                            interaction.followUp(`${errorMsg}\n${__("so_i_will_send_it_here")}`)

                            if (isFile) interaction.followUp({ files: [content] })
                            else interaction.followUp(content)
                        }
                    }
                }

                bot.calls.set(interaction.guild.id, bot.calls.get(interaction.guild.id) - 1)
            }
            else {
                bot.db.prepare("UPDATE calls SET channel_id = ? WHERE guild_id = ?").run(null, interaction.guild.id)
                deleteRowIfEmpty(bot.db, interaction.guild.id)
                interaction.reply({ content: `${__("presence_channel_not_found")} ${__("kirino_what")}`, ephemeral: true })
            }
        }
    }
}

function deleteRowIfEmpty(db, guild_id) {
    const { channel_id, dm, asfile } = db.prepare("SELECT * FROM calls WHERE guild_id = ?").get(guild_id)
    if (channel_id === null && dm === 0 && asfile === 0) db.prepare("DELETE FROM calls WHERE guild_id = ?").run(guild_id)
}