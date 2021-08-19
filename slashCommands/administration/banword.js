const { SlashCommandBuilder } = require("@discordjs/builders")
const { Permissions } = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("banword")
        .setDescription("Manage the banned words of the server")
        .addSubcommand(option => option.setName("add").setDescription("Add a word to the banned words").addStringOption(option => option.setName("word").setDescription("The word to add to the banned words").setRequired(true)))
        .addSubcommand(option => option.setName("remove").setDescription("Remove a word from the banned words").addStringOption(option => option.setName("word").setDescription("The word to remove from the banned words").setRequired(true)))
        .addSubcommand(option => option.setName("list").setDescription("Tell you what words are currently in the banned words")),
    guildOnly: true,
    permissions: ["manage messages"],

    async execute(bot, interaction) {
        if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) return interaction.reply({ content: `${__("missing_permissions_to_execute_this_command")} ${__("kirino_pout")}`, ephemeral: true })

        const parseEmoji = mot => {
            if (mot.match(/<:(.*?):[0-9]*>/gm)) { // modification de la représentation des émojis
                return ":" + mot.split(":")[1].split(":")[0] + ":"
            }
            else return mot
        }

        const subcommand = interaction.options.getSubcommand()

        if (subcommand === "add") {
            const word = parseEmoji(interaction.options.getString("word"))

            const bannedWords = bot.db.prepare("SELECT * FROM banwords WHERE guild_id = ?").all(interaction.guild.id).map(row => row.word)
            const banwordsCount = bannedWords.length > 0 ? bannedWords.length : 0

            if (banwordsCount + 1 > 40) {
                return interaction.reply({ content: `${__("banwords_count_limited")} ${__("kirino_pout")}`, ephemeral: true })
            }

            if (word.length > 25) return interaction.reply({ content: __("word_beyond_25_chars") + " " + __("kirino_pout"), ephemeral: true })

            bot.db.prepare("INSERT INTO banwords(guild_id, word) VALUES(?,?)").run(interaction.guild.id, word)

            interaction.reply(`${__("the_word")} \`${word}\` ${__("has_been_added_to_banwords")}`)
        }

        else if (subcommand === "list") {
            const wordsList = bot.db.prepare("SELECT * FROM banwords WHERE guild_id = ?").all(interaction.guild.id).map(row => row.word)

            interaction.reply((wordsList.length > 0 ? `${__("here_is_banword_list")} :\n\`${wordsList.join("`, `")}\`` : __("no_banwords_for_now") + " " + __("kirino_glad")))
        }

        else if (subcommand === "remove") {
            const word = parseEmoji(interaction.options.getString("word"))

            const banwords = bot.db.prepare("SELECT * FROM banwords WHERE guild_id = ?").all(interaction.guild.id).map(row => row.word)
            if (banwords.includes(word)) {
                bot.db.prepare("DELETE FROM banwords WHERE guild_id = ? AND word = ?").run(interaction.guild.id, word)
                interaction.reply(`${__("word_removed_from_banword")} ${__("kirino_glad")}`)
            }
            else {
                interaction.reply({ content: `${__("word_not_found_in_banwords")} ${__("kirino_glad")}`, ephemeral: true })
            }
        }
    }
}