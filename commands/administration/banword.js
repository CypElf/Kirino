const { Permissions } = require("discord.js")

module.exports = {
    name: "banword",
    guildOnly: true,
    args: true,
    aliases: ["bw"],
    permissions: ["manage messages"],

    async execute(bot, msg, [mode, ...words]) {
        if (!msg.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) return msg.channel.send(`${__("missing_permissions_to_execute_this_command")} ${__("kirino_pout")}`)

        const guild = msg.guild.id

        const parseEmoji = mot => {
            if (mot.match(/<:(.*?):[0-9]*>/gm)) { // modification de la représentation des émojis
                return ":" + mot.split(":")[1].split(":")[0] + ":"
            }
            else return mot
        }

        if (mode === "add") {
            if (words.length < 1) return msg.channel.send(__("please_insert_banwords_to_add"))

            const banwordsRequest = bot.db.prepare("SELECT * FROM banwords WHERE guild_id = ?")
            let banwordsRows = banwordsRequest.all(guild)
            let banwordsCount
            if (banwordsRows.length !== 0) {
                banwordsRows = banwordsRows.map(row => row.word)
                banwordsCount = banwordsRows.length
            }
            else {
                banwordsCount = 0
            }

            if (banwordsCount + words.length > 40) {
                return msg.channel.send(`${__("banwords_count_limited")} ${__("kirino_pout")}`)
            }

            words = words.map(mot => parseEmoji(mot))

            if (words.filter(mot => mot.length > 25).length !== 0) return msg.channel.send(__("word_beyond_25_chars") + " " + __("kirino_pout"))

            words.forEach(mot => {
                const addBanwordCommand = bot.db.prepare("INSERT INTO banwords(guild_id,word) VALUES(?,?)")
                addBanwordCommand.run(guild, mot)
            })
            let content = __n("the_word", words.length) + " `"
            if (words.length === 1) content += words[0]

            else {
                content += words.join("`, `")
            }

            content += "` " + __n("has_been_added_to_banwords", words.length)

            msg.channel.send(content)
        }

        else if (mode === "list") {
            let list = __("here_is_banword_list") + " :\n"
            const listBanwordsRequest = bot.db.prepare("SELECT * FROM banwords WHERE guild_id = ?")
            let wordsList = listBanwordsRequest.all(guild)

            if (wordsList.length !== 0) {
                wordsList = wordsList.map(row => row.word)
                list += "`" + wordsList.join("`, `") + "`"
            }
            else {
                list = __("no_banwords_for_now")
            }

            msg.channel.send(list)
        }

        else if (mode === "remove") {
            if (words.length < 1) return msg.channel.send(__("precise_banwords_to_remove"))
            const removed = []
            const notRemoved = []
            const removeBanwordsRequest = bot.db.prepare("SELECT * FROM banwords WHERE guild_id = ?")
            let banwords = removeBanwordsRequest.all(guild)

            if (banwords.length !== 0) {
                banwords = banwords.map(row => row.word)
                words.forEach(word => {
                    word = parseEmoji(word)
                    if (banwords.includes(word)) {
                        banwords = banwords.filter(bannedWord => bannedWord !== word)
                        removed.push(word)
                    }
                    else {
                        notRemoved.push(word)
                    }

                    const deleteCommand = bot.db.prepare("DELETE FROM banwords WHERE guild_id = ? AND word = ?")
                    deleteCommand.run(guild, parseEmoji(word))
                })
            }

            let answer = ""
            if (removed.length === 0) {
                answer += __("no_word_has_been_deleted") + "\n"
            }
            else {
                answer += __("following_words_has_been_removed") + " : `" + removed.join("`, `") + "`\n"
            }
            if (notRemoved.length > 0) {
                answer += __("words_not_founds") + " : `" + notRemoved.join("`, `") + "`"
            }
            msg.channel.send(answer)
        }

        else {
            return msg.channel.send(__("please_use_valid_mode"))
        }
    }
}