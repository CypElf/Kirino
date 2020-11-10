const Discord = require("discord.js")
const fs = require("fs")
const bsqlite3 = require("better-sqlite3")
const i18n = require("i18n")
const yaml = require("js-yaml")

require("dotenv").config()

const bot = new Discord.Client(Discord.Intents.NON_PRIVILEGED)

bot.commands = new Discord.Collection()
bot.db = new bsqlite3("database.db", { fileMustExist: true })

const commandsCooldowns = new Discord.Collection()
const xpCooldowns = new Discord.Collection()
const apiCooldowns = new Map()

i18n.configure({
    locales: ['en', 'fr'],
    staticCatalog: {
        en: yaml.safeLoad(fs.readFileSync("./languages/en.yml", "utf-8")),
        fr: yaml.safeLoad(fs.readFileSync("./languages/fr.yml", "utf-8")),
    },
    register: global,
})

const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"))

for (const file of commandFiles) {
    const command = require(`./commands/${file}`)
	bot.commands.set(command.name, command)
}

const startXpApi = require("./lib/start_xp_api")
startXpApi(bot, { cooldowns: apiCooldowns })

bot.db.prepare("UPDATE presences SET locked = ?").run(0) // unlock calls if the bot stopped while there were some in progress that couldn't release the lock after their end

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
    const prefixRequest = bot.db.prepare("SELECT * FROM prefixs WHERE id = ?")
    let id
    if (msg.guild) id = msg.guild.id
    else id = msg.author.id
    let prefix = prefixRequest.get(id)
    if (!prefix) prefix = ";"
    else prefix = prefix.prefix
    bot.prefix = prefix

    if (msg.author.bot) return

    const messageArray = msg.content.split(" ")
    const commandName = messageArray[0].toLowerCase().slice(bot.prefix.length)
    const args = messageArray.slice(1)

    const command = bot.commands.get(commandName) || bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))

    // maintenance
    // if (!msg.content.startsWith(bot.prefix)) return
    // if (!command) return
    // return msg.channel.send(__("maintenance"))

    if (msg.guild) {
        // minimal permissions
        if (!msg.guild.me.hasPermission("SEND_MESSAGES")) return
        if (msg.content.startsWith(bot.prefix) && command) {
            if (!msg.guild.me.hasPermission("MANAGE_MESSAGES")) return msg.channel.send(__("need_handle_messages_perm"))
            if (!msg.guild.me.hasPermission("EMBED_LINKS")) return msg.channel.send(__("need_embed_links"))
            if (!msg.guild.me.hasPermission("READ_MESSAGE_HISTORY")) return msg.channel.send(__("need_read_message_history"))
        }
    }

    const setLanguage = require("./lib/set_language")
    setLanguage(bot, msg)

    const checkAfk = require("./lib/check_afk")
    checkAfk(bot, msg)

    const checkBanwords = require("./lib/check_banwords")
    checkBanwords(bot, msg)

    const handleXp = require("./lib/handle_xp")
    await handleXp(bot, msg, { cooldowns: xpCooldowns })

    // ------------------------------------------------------------- command validity check

    if (!msg.content.startsWith(bot.prefix)) return
    if (!command) return

    if (command.guildOnly && !msg.guild) {
        return msg.reply(`${__("command_not_available_in_dm")} ${__("kirino_pout")}`)
    }

    // ------------------------------------------------------------- command cooldown check

    if (!commandsCooldowns.has(command.name)) {
        commandsCooldowns.set(command.name, new Discord.Collection())
    }
    
    const now = Date.now()
    const timestamps = commandsCooldowns.get(command.name)
    const cooldown = (command.cooldown || 2) * 1000 // default cooldown is 2 seconds
    
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
        if (command.category === "ignore") return
        return bot.commands.get("help").execute(bot, msg, [].concat(commandName))
    }

    try {
        command.execute(bot, msg, args)
    }
    catch (err) {
        console.error(err)
    }
})

bot.on("guildCreate", guild  => {
    console.log(`Server joined: ${guild.name}`)
    updateActivity()
})

bot.on("guildDelete", guild => {
    console.log(`Server left: ${guild.name}`)
    const id = guild.id
    let deletionRequest = bot.db.prepare("DELETE FROM banwords WHERE guild_id = ?")
    deletionRequest.run(id)
    deletionRequest = bot.db.prepare("DELETE FROM languages WHERE id = ?")
    deletionRequest.run(id)
    deletionRequest = bot.db.prepare("DELETE FROM prefixs WHERE id = ?")
    deletionRequest.run(id)
    deletionRequest = bot.db.prepare("DELETE FROM rules WHERE guild_id = ?")
    deletionRequest.run(id)
    deletionRequest = bot.db.prepare("DELETE FROM presences WHERE guild_id = ?")
    deletionRequest.run(id)
    deletionRequest = bot.db.prepare("DELETE FROM joins_leaves WHERE guild_id = ?")
    deletionRequest.run(id)
    deletionRequest = bot.db.prepare("DELETE FROM xp_blacklisted_channels WHERE guild_id = ?")
    deletionRequest.run(id)
    deletionRequest = bot.db.prepare("DELETE FROM xp_blacklisted_roles WHERE guild_id = ?")
    deletionRequest.run(id)
    deletionRequest = bot.db.prepare("DELETE FROM xp_guilds WHERE guild_id = ?")
    deletionRequest.run(id)
    deletionRequest = bot.db.prepare("DELETE FROM xp_roles WHERE guild_id = ?")
    deletionRequest.run(id)
    updateActivity()
})

bot.on("messageUpdate", async (oldMsg, newMsg) => {
    const checkBanwords = require("./lib/check_banwords")
    checkBanwords(bot, newMsg)
})

bot.on("guildMemberAdd", async member => {
    const handleMemberAdd = require("./lib/handle_member_add")
    handleMemberAdd(bot.db, member)
})

bot.on("guildMemberRemove", async member => {
    const handleMemberRemove = require("./lib/handle_member_remove")
    handleMemberRemove(bot.db, member)
})

function updateActivity () {
    guildsCount = bot.guilds.cache.size
    bot.user.setActivity(`${guildsCount} servers | some commands involving guild members events are broken for at least one week, please be careful! | ;help`, { type: "LISTENING" /*PLAYING, STREAMING, LISTENING or WATCHING*/ })
}

process.on('unhandledRejection', error => {
	console.error('Unhandled promise rejection:', error)
})

bot.login(process.env.KIRINO_TOKEN)