module.exports = {
	name: "banword",
    description: "banword_description",
    guildOnly: true,
    args: true,
    usage: "banword_usage",
    aliases: ["bw"],
    category: "admin",

    async execute (bot, msg, [mode, ...mots]) {
        if (!msg.member.hasPermission("MANAGE_MESSAGES")) return msg.channel.send(__("missing_permissions_to_execute_this_command") + " <:kirinopout:698923065773522944>");

        const bsqlite3 = require("better-sqlite3");
        const db = new bsqlite3("database.db", { fileMustExist: true });

        const guild = msg.guild.id;

        if (mode === "add") {
            if (mots.length < 1) return msg.channel.send(__("please_insert_banwords_to_add"));
            if (mots.filter(mot => mot.includes("|")).length !== 0) return msg.channel.send(__("cannot_store_|") + " <:kirinopout:698923065773522944>");
                
            const banwordsRequest = db.prepare("SELECT * FROM banwords WHERE id = ?");
            const banwordsRow = banwordsRequest.get(guild);
            let bannedWords = [];
            let currentBannedWordsCount = 0;
            
            if (!(banwordsRow === undefined || banwordsRow.words === undefined)) {
                bannedWords = banwordsRow.words.split(",");
                currentBannedWordsCount = bannedWords.length;
            }

            if (currentBannedWordsCount + mots.length > 100) {
                return msg.channel.send(__("banwords_count_limited") + " <:kirinopout:698923065773522944>");
            }

            mots.forEach(mot => {
                const addBanwordCommand = db.prepare("INSERT INTO banwords(id,words) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET words=words || '|' || excluded.words")
                addBanwordCommand.run(guild, mot);
            });
            let content = __n("the_word", mots.length) + " `";
            if (mots.length === 1) content += mots[0];

            else {
                content += mots.join("`, `");
            }

            content += "` " + __n("has_been_added_to_banwords", mots.length);

            msg.channel.send(content);
        }

        else if (mode === "list") {
            let liste = __("here_is_banword_list") + " :\n";
            const listBanwordsRequest = db.prepare("SELECT * FROM banwords WHERE id = ?");
            const listRow = listBanwordsRequest.get(guild);
            if (listRow === undefined || listRow.words === undefined) liste = __("no_banwords_for_now");
            else {
                const contenu = listRow.words.split("|");
                liste += "`" + contenu.join("`, `") + "`";
            }
            msg.channel.send(liste); 
        }

        else if (mode === "remove") {
            if (mots.length < 1) return msg.channel.send(__("precise_banwords_to_remove"));
            let bannedWords;
            let removed = [];
            let notRemoved = [];
            const removeBanwordsRequest = db.prepare("SELECT * FROM banwords WHERE id = ?");
            const removeRow = removeBanwordsRequest.get(guild);

            if (removeRow === undefined || removeRow.words === undefined) return msg.channel.send(__("no_banwords_on_this_server"));
            bannedWords = removeRow.words.split("|");

            mots.forEach(mot => {
                if (bannedWords.includes(mot)) {
                    bannedWords = bannedWords.filter(bannedWord => bannedWord !== mot);
                    removed.push(mot);
                }
                else {
                    notRemoved.push(mot);
                }

                if (bannedWords.length < 1) {
                    const deleteCommand = db.prepare("DELETE FROM banwords WHERE id = ?");
                    deleteCommand.run(guild);
                }
                else {
                    const deleteCommand = db.prepare("INSERT INTO banwords(id,words) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET words=excluded.words");
                    deleteCommand.run(guild, bannedWords.join(","));
                }
            });

            let answer = "";
            if (removed.length === 0) {
                answer += __("no_word_has_been_deleted") + "\n";
            }
            else {
                answer += __("following_words_has_been_removed") + " : `" + removed.join("`, `") + "`\n";
            }
            if (notRemoved.length > 0) {
                answer += __("words_not_founds") + " : `" + notRemoved.join("`, `") + "`";
            }
            msg.channel.send(answer);
        }

        else {
            return msg.channel.send(__("please_use_valid_mode"));
        }
    }
};