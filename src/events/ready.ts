import { Kirino } from "../lib/misc/types"
import { Birthday } from "../lib/misc/database"
import updateActivity from "../lib/misc/update_activity"
import { scheduleBirthday } from "../lib/birthday/schedule"

export function eventHandler(bot: Kirino) {
    bot.once("ready", async () => {
        updateActivity(bot)

        const userBirthdays = bot.db.prepare("SELECT * FROM birthdays").all() as Birthday[]
        for (const userBirthday of userBirthdays) {
            const [day, month] = userBirthday.birthday.split("/").map(n => parseInt(n))
            const job = scheduleBirthday(bot, userBirthday.user_id, day, month)
            bot.birthdaysJobs.set(userBirthday.user_id, job)
        }

        console.log("Connection to Discord established")
    })
}