const Discord = require("discord.js")
const config = require("./config.json")
const fs = require("fs")
const bsqlite3 = require("better-sqlite3")
const i18n = require("i18n")
const querystring = require("querystring")
const https = require("https")
require("dotenv").config()

const bot = new Discord.Client(Discord.Intents.NON_PRIVILEGED)
bot.commands = new Discord.Collection()

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

bot.once("ready", () => {
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

    // maintenance
    // if (msg.content.startsWith(bot.config.prefix)) return msg.channel.send("Maintenance en cours, veuillez patienter quelques instants, désolée pour la gêne occasionée !")
    // else return

    if (msg.author.bot) return
    if (msg.channel.type === "text") {
        if (!msg.guild.me.hasPermission("SEND_MESSAGES")) return
        if (msg.content.startsWith(bot.config.prefix) && !msg.guild.me.hasPermission("MANAGE_MESSAGES")) return msg.channel.send(__("need_handle_messages_perm"))
    }

    const messageArray = msg.content.split(" ")
    const commandName = messageArray[0].toLowerCase().slice(bot.config.prefix.length)
    const args = messageArray.slice(bot.config.prefix.length)

    const db = new bsqlite3("database.db", { fileMustExist: true })

    // ------------------------------------------------------------- paramétrage de la bonne langue

    let callerID
    if (msg.channel.type === "text") callerID = msg.guild.id
    else callerID = msg.author.id

    const languagesRequest = db.prepare("SELECT * FROM languages WHERE id = ?")
    const languageRow = languagesRequest.get(callerID)
    if (languageRow !== undefined) {
        setLocale(languageRow.language)
    }
    else {
        setLocale("en")
    }


    // ------------------------------------------------------------- vérification de l'AFK

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
        msg.reply(__("deleted_from_afk")).then(msg => msg.delete({ timeout: 5000 }))
    }
    
    // ------------------------------------------------------------- vérification si un des mots est dans les mots bloqués du serveur

    if (msg.channel.type == "text") {
        if (!msg.content.startsWith(bot.config.prefix + "banword remove") && !msg.content.startsWith(bot.config.prefix + "banword add")) {

            const banwordsRequest = db.prepare("SELECT * FROM banwords WHERE guild_id = ?")
            let banwords = banwordsRequest.all(msg.guild.id)

            if (banwords) {
                banwords = banwords.map(row => row.word.toLowerCase())
                let emojiNames = msg.content.match(/<:(.*?):[0-9]*>/gm)
                if (emojiNames) emojiNames = emojiNames.map(emoji => emoji.split(":")[1].split(":")[0])
                const loweredMessageArray = messageArray.map(word => word.toLowerCase())
                for (let word of banwords) {
                    if (loweredMessageArray.includes(word.toLowerCase())) return msg.delete()
                    if (emojiNames) {
                        if (word.startsWith(":") && word.endsWith(":")) {
                            word = word.substring(1, word.length - 1)
                            if (emojiNames.includes(word)) return msg.delete()
                        }
                    }
                }
            }
        }
    }

    // -------------------------------------------------------------------------------

    if (!msg.content.startsWith(bot.config.prefix)) return

    // ------------------------------------------------------------- vérification de la commande spéciale guilds
    
    if (commandName == "guilds" && config.ownerID == msg.author.id) {
        let allInvites = ""
        for (const guild of bot.guilds.cache.array()) {
            allInvites += `- ${guild.name} :\n\n`
            try {
                let guildInvites = await guild.fetchInvites()
                let invitesArray = guildInvites.array().map(guildInvite => {
                    return "https://discord.gg/" + guildInvite.code
                })
                let invites
                if (invitesArray.length === 0) invites = __("no_invit_available") + "\n"
                else invites = invitesArray.join("\n") + "\n"
                allInvites += invites + "\n"
            }
            catch (err) {
                allInvites += __("missing_permissions_to_get_invits") + "\n\n"
            }
        }

        const query = querystring.stringify({
            api_paste_code: allInvites,
            api_paste_name: __("invitations").substring(0, __("invitations").length - 2),
            api_paste_private: 1,
            api_paste_expire_date: "1D",
            api_dev_key: process.env.PASTEBIN_DEV_KEY,
            api_option: "paste",
        })

        const req = https.request({
            hostname: "pastebin.com",
            port: 443,
            path: "/api/api_post.php",
            method: "POST",
            headers: {
                'Content-Type': "application/x-www-form-urlencoded",
                'Content-Length': query.length
            }
        }, res => {
            let data = ""
            res.on("data", piece => {
                data += piece
            })

            res.on("end", () => {
                msg.channel.send(data)
            })
        })

        req.write(query)
        req.end()
    }

    // ------------------------------------------------------------- vérification de la validité de la commande et exécution

    const command = bot.commands.get(commandName) || bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))
    if (!command) return

    if (command.guildOnly && msg.channel.type !== "text") {
        return msg.reply(__("command_not_available_in_dm") + " <:kirinopout:698923065773522944>")
    }

    if (command.args && !args.length) {
        return bot.commands.get("help").execute(bot, msg, [].concat(commandName))
    }

    try {
        command.execute(bot, msg, args)
    }
    catch (err) {
        console.error(err)
    }
})

// ------------------------------------------------------------- évènements ajout / retrait de serveurs

bot.on("guildCreate", guild  => {
    console.log(`Server joined: ${guild.name}`)
    updateActivity()
})
bot.on("guildDelete", guild => {
    console.log(`Server left: ${guild.name}`)
    updateActivity()
})

// ------------------------------------------------------------- fonction pour mettre à jour le rich presence en fonction du nombre de serveurs sur lequel le bot est

const updateActivity = () => {
    guildsCount = bot.guilds.cache.size
    bot.user.setActivity(`${guildsCount} servers | ${bot.config.prefix}help`, { type: "LISTENING" /*PLAYING, STREAMING, LISTENING ou WATCHING*/ })
}

bot.login(process.env.KIRINO_BETA_TOKEN)