const Discord = require("discord.js")
const config = require("./config.json")
const fs = require("fs")
const bsqlite3 = require("better-sqlite3")
const i18n = require("i18n")

require("dotenv").config()

const bot = new Discord.Client(Discord.Intents.NON_PRIVILEGED)
bot.commands = new Discord.Collection()
const cooldowns = new Discord.Collection()
bot.config = config

i18n.configure({
    locales: ['en', 'fr'],
    directory: __dirname + "/languages",
    autoReload: true,
    register: global,
})

const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"))

for (const file of commandFiles) {
    const command = require(`./commands/${file}`)
	bot.commands.set(command.name, command)
}

bot.once("ready", async () => {
    updateActivity()
    let startDate = new Date()
    const startMonth = String(startDate.getMonth() + 1).padStart(2, "0")
    const startDay = String(startDate.getDate()).padStart(2, "0")
    const startYear = startDate.getFullYear()
    const startHour = String(startDate.getHours()).padStart(2, "0")
    const startMinutes = String(startDate.getMinutes()).padStart(2, "0")
    const startSeconds = String(startDate.getSeconds()).padStart(2, "0")
    startDate = `${startHour}:${startMinutes}:${startSeconds} ${startDay}/${startMonth}/${startYear}`
    console.log(`Connection to Discord established (${startDate})`)
})

// -------------------------------------------------------------

bot.on("message", async msg => {
    const db = new bsqlite3("database.db", { fileMustExist: true })
    const prefixRequest = db.prepare("SELECT * FROM prefixs WHERE id = ?")
    let id
    if (msg.guild) id = msg.guild.id
    else id = msg.author.id
    let prefix = prefixRequest.get(id)
    if (!prefix) prefix = ";"
    else prefix = prefix.prefix
    bot.prefix = prefix

    // maintenance
    // if (msg.content.startsWith(bot.prefix)) return msg.channel.send(__("maintenance"))
    // else return

    if (msg.author.bot) return
    if (msg.guild) {
        if (!msg.guild.me.hasPermission("SEND_MESSAGES")) return
        if (msg.content.startsWith(bot.prefix) && !msg.guild.me.hasPermission("MANAGE_MESSAGES")) return msg.channel.send(__("need_handle_messages_perm"))
        if (msg.content.startsWith(bot.prefix) && !msg.guild.me.hasPermission("EMBED_LINKS")) return msg.channel.send(__("need_embed_links"))
        if (msg.content.startsWith(bot.prefix) && !msg.guild.me.hasPermission("READ_MESSAGE_HISTORY")) return msg.channel.send(__("need_read_message_history"))
    }

    const messageArray = msg.content.split(" ")
    const commandName = messageArray[0].toLowerCase().slice(bot.prefix.length)
    const args = messageArray.slice(1)

    // ------------------------------------------------------------- language settings

    let callerID
    if (msg.guild) callerID = msg.guild.id
    else callerID = msg.author.id

    const languagesRequest = db.prepare("SELECT * FROM languages WHERE id = ?")
    const languageRow = languagesRequest.get(callerID)
    if (languageRow !== undefined) {
        setLocale(languageRow.language)
    }
    else {
        setLocale("en")
    }


    // ------------------------------------------------------------- AFK check

    const mentions = msg.mentions.users

    const afkRequest = db.prepare("SELECT * FROM afk WHERE user_id = ?")

    mentions.forEach(mention => {
        const mentionnedAfkRow = afkRequest.get(mention.id)

        if (!(mentionnedAfkRow === undefined)) {
            if (mentionnedAfkRow.id != msg.author.id) {
                if (mentionnedAfkRow.reason) {
                    msg.channel.send(`**${mention.username}**` + __("afk_with_reason") + mentionnedAfkRow.reason)
                }
                else {
                    msg.channel.send(`**${mention.username}**` + __("afk_without_reason"))
                }
            }
        }
    })

    const selfAfkRow = afkRequest.get(msg.author.id)

    if (!(selfAfkRow === undefined)) {
        const deletionRequest = db.prepare("DELETE FROM afk WHERE user_id = ?")
        deletionRequest.run(msg.author.id)
        msg.reply(__("deleted_from_afk")).then(msg => msg.delete({ timeout: 5000 })).catch(() => {})
    }
    
    // ------------------------------------------------------------- banwords check on message

    checkWords(msg, messageArray, db)

    // ------------------------------------------------------------- ignore non command messages

    if (!msg.content.startsWith(bot.prefix)) return

    // ------------------------------------------------------------- command check

    const command = bot.commands.get(commandName) || bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))
    if (!command) return

    if (command.guildOnly && !msg.guild) {
        return msg.reply(__("command_not_available_in_dm") + " <:kirinopout:698923065773522944>")
    }

    // ------------------------------------------------------------- cooldown check

    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection())
    }
    
    const now = Date.now()
    const timestamps = cooldowns.get(command.name)
    const cooldown = (command.cooldown || 2) * 1000 // default cooldown is 2 seconds, for commands without a cooldown
    
    if (timestamps.has(msg.author.id)) {
        const expiration = timestamps.get(msg.author.id) + cooldown
    
        if (now < expiration) {
            const timeLeft = (expiration - now) / 1000
            return msg.channel.send(`${__("please_wait")} ${timeLeft.toFixed(1)} ${__("more_sec_before_reusing_command")} \`${command.name}\`.`)
        }
    }

    timestamps.set(msg.author.id, now)
    setTimeout(() => timestamps.delete(msg.author.id), cooldown)

    if (command.args && !args.length) {
        if (command.category === "ignore") return;
        return bot.commands.get("help").execute(bot, msg, [].concat(commandName))
    }

    try {
        command.execute(bot, msg, args)
    }
    catch (err) {
        console.error(err)
    }
})

// ------------------------------------------------------------- join / leave

bot.on("guildCreate", guild  => {
    console.log(`Server joined: ${guild.name}`)
    updateActivity()
})
bot.on("guildDelete", guild => {
    console.log(`Server left: ${guild.name}`)
    const id = guild.id
    const db = new bsqlite3("database.db", { fileMustExist: true })
    let deletionRequest = db.prepare("DELETE FROM banwords WHERE guild_id = ?")
    deletionRequest.run(id)
    deletionRequest = db.prepare("DELETE FROM languages WHERE id = ?")
    deletionRequest.run(id)
    deletionRequest = db.prepare("DELETE FROM prefixs WHERE id = ?")
    deletionRequest.run(id)
    deletionRequest = db.prepare("DELETE FROM rules WHERE guild_id = ?")
    deletionRequest.run(id)
    updateActivity()
})

// ------------------------------------------------------------- banwords check on edit

bot.on("messageUpdate", async (oldMsg, newMsg) => {
    const db = new bsqlite3("database.db", { fileMustExist: true })
    const messageArray = newMsg.content.split(" ")
    checkWords(newMsg, messageArray, db)
})

// ------------------------------------------------------------- banword check function for message and edit events

const checkWords = (msg, messageArray, db) => {
    if (msg.guild) {
        if (!msg.content.startsWith(bot.prefix + "banword remove") && !msg.content.startsWith(bot.prefix + "banword add")) {
    
            const banwordsRequest = db.prepare("SELECT * FROM banwords WHERE guild_id = ?")
            let banwords = banwordsRequest.all(msg.guild.id)
    
            if (banwords) {
                banwords = banwords.map(row => row.word.toLowerCase())
                let emojiNames = msg.content.match(/<:(.*?):[0-9]*>/gm)
                if (emojiNames) emojiNames = emojiNames.map(emoji => emoji.split(":")[1].split(":")[0])
                const loweredMessageArray = messageArray.map(word => word.toLowerCase())
                for (let word of banwords) {
                    if (loweredMessageArray.includes(word.toLowerCase())) return msg.delete().catch(() => {})
                    if (emojiNames) {
                        if (word.startsWith(":") && word.endsWith(":")) {
                            word = word.substring(1, word.length - 1)
                            if (emojiNames.includes(word) && !bot.commands.get(word.toLowerCase()).autodelete) return msg.delete().catch(() => {})
                        }
                    }
                }
            }
        }
    }
}

// ------------------------------------------------------------- update bot activity

const updateActivity = () => {
    guildsCount = bot.guilds.cache.size
    bot.user.setActivity(`${guildsCount} servers | ;help`, { type: "LISTENING" /*PLAYING, STREAMING, LISTENING ou WATCHING*/ })
}

bot.login(process.env.KIRINO_TOKEN)