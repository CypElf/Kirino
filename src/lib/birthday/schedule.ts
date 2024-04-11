import { TextChannel } from "discord.js"
import schedule from "node-schedule"
import { Kirino } from "../misc/types"
import { BirthdayMetadata } from "../misc/database"
import { t } from "../misc/i18n"

export function scheduleBirthday(bot: Kirino, user_id: string, day: number, month: number) {
    const utcDateNow = new Date(new Date().toUTCString())

    // months in JS dates are 0-indexed, so we need to add 1
    let celebratedYear = utcDateNow.getFullYear()
    if (month - 1 < utcDateNow.getMonth() || (month - 1 === utcDateNow.getMonth() && day <= utcDateNow.getDate())) {
        celebratedYear++
    }

    // we schedule the birthday message to be sent at 9AM
    // not midnight because depending on the timezone of the user, the message could actually be sent too early
    const birthdayMorning = new Date(celebratedYear, month - 1, day, 9, 0, 0)

    return schedule.scheduleJob(birthdayMorning, async () => {
        const birthdayServers = bot.db.prepare("SELECT * FROM birthdays_metadata WHERE enabled = 1").all() as BirthdayMetadata[]

        for (const birthdayServer of birthdayServers) {
            const guild = await bot.guilds.fetch(birthdayServer.guild_id)
            const member = await guild.members.fetch(user_id)

            if (member) {
                const channel = await guild.channels.fetch(birthdayServer.channel_id as string)

                let birthdayMessage = birthdayServer.message ?? t("common:happy_birthday")
                birthdayMessage = birthdayMessage.replaceAll("{username}", member.user.username).replaceAll("{mention}", member.toString())
                try {
                    await (channel as TextChannel).send(birthdayMessage)
                }
                catch {
                    // disable the birthday system because the channel is not accessible
                    if (!birthdayServer.message) {
                        bot.db.prepare("DELETE FROM birthdays_metadata WHERE guild_id = ?").run(birthdayServer.guild_id)
                    }
                    else {
                        bot.db.prepare("INSERT INTO birthdays_metadata(guild_id, enabled, channel_id) VALUES(?,?,?) ON CONFLICT(guild_id) DO UPDATE SET enabled = ?, channel_id = ?").run(birthdayServer.guild_id, 0, null, 0, null)
                    }
                }
            }
        }

        // reschedule the job for the next year
        bot.birthdaysJobs.delete(user_id)
        const job = scheduleBirthday(bot, user_id, day, month)
        bot.birthdaysJobs.set(user_id, job)
    })
}