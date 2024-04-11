import { TextChannel } from "discord.js"
import schedule from "node-schedule"
import { Kirino } from "../lib/misc/types"
import { Birthday, BirthdayMetadata } from "../lib/misc/database"
import updateActivity from "../lib/misc/update_activity"
import { t } from "../lib/misc/i18n"

export function eventHandler(bot: Kirino) {
    bot.once("ready", async () => {
        updateActivity(bot)

        const userBirthdays = bot.db.prepare("SELECT * FROM birthdays").all() as Birthday[]
        for (const userBirthday of userBirthdays) {
            const [day, month] = userBirthday.birthday.split("/").map(n => parseInt(n))
            const utcDateNow = new Date(new Date().toUTCString())

            // months in JS dates are 0-indexed, so we need to add 1
            // we ignore the birthdays in the past
            if (utcDateNow.getDay() < day && utcDateNow.getMonth() <= month - 1) {
                // we schedule the birthday message to be sent at 8AM
                // not midnight because depending on the timezone of the user, the message could actually be sent too early
                const birthdayMorning = new Date(utcDateNow.getFullYear(), month - 1, day, 8, 0, 0)

                schedule.scheduleJob(birthdayMorning, async () => {
                    const birthdayServers = bot.db.prepare("SELECT * FROM birthdays_metadata WHERE enabled = 1").all() as BirthdayMetadata[]

                    for (const birthdayServer of birthdayServers) {
                        const guild = await bot.guilds.fetch(birthdayServer.guild_id)
                        const member = await guild.members.fetch(userBirthday.user_id)

                        if (member) {
                            const channel = await guild.channels.fetch(birthdayServer.channel_id as string)

                            let birthdayMessage = birthdayServer.message ?? t("ready:happy_birthday")
                            birthdayMessage = birthdayMessage.replaceAll("{username}", member.user.username).replaceAll("{user}", member.toString()).replaceAll("{tag}", member.user.tag)
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
                })
            }
        }

        console.log("Connection to Discord established")
    })
}