import { SlashCommandBuilder } from "@discordjs/builders"
import { CommandInteraction, GuildMember, Permissions } from "discord.js"
import i18next from "i18next"
import { Kirino } from "../../lib/misc/types"
import { Banword } from "../../lib/misc/database"

const t = i18next.t.bind(i18next)

export const command = {
    data: new SlashCommandBuilder()
        .setName("banword")
        .setDescription("Manage the banned words of the server")
        .addSubcommand(option => option.setName("add").setDescription("Add a word to the banned words").addStringOption(option => option.setName("word").setDescription("The word to add to the banned words").setRequired(true)))
        .addSubcommand(option => option.setName("remove").setDescription("Remove a word from the banned words").addStringOption(option => option.setName("word").setDescription("The word to remove from the banned words").setRequired(true)))
        .addSubcommand(option => option.setName("list").setDescription("Tell you what words are currently in the banned words")),
    guildOnly: true,
    permissions: ["manage messages"],

    async execute(bot: Kirino, interaction: CommandInteraction) {
        const member = interaction.member as GuildMember | null
        if (member && !member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) return interaction.reply({ content: `${t("missing_permissions_to_execute_this_command")} ${t("common:kirino_pout")}`, ephemeral: true })

        const parseEmoji = (mot: string) => {
            if (mot.match(/<:(.*?):[0-9]*>/gm)) { // modification de la représentation des émojis
                return ":" + mot.split(":")[1].split(":")[0] + ":"
            }
            else return mot
        }

        const subcommand = interaction.options.getSubcommand()

        if (subcommand === "add") {
            const word = parseEmoji(interaction.options.getString("word") as string)

            const bannedWords = bot.db.prepare("SELECT * FROM banwords WHERE guild_id = ?").all(interaction.guild?.id)
            const banwordsCount = bannedWords.length > 0 ? bannedWords.length : 0

            if (banwordsCount + 1 > 40) {
                return interaction.reply({ content: `${t("banwords_count_limited")} ${t("common:kirino_pout")}`, ephemeral: true })
            }

            if (word.length > 25) return interaction.reply({ content: t("word_beyond_25_chars") + " " + t("common:kirino_pout"), ephemeral: true })

            bot.db.prepare("INSERT INTO banwords(guild_id, word) VALUES(?,?)").run(interaction.guild?.id, word)

            interaction.reply(`${t("word_added_to_banwords", { word })} ${t("common:kirino_glad")}`)
        }

        else if (subcommand === "list") {
            const wordsList = bot.db.prepare("SELECT * FROM banwords WHERE guild_id = ?").all(interaction.guild?.id) as Banword[]

            interaction.reply((wordsList.length > 0 ? `${t("here_is_banword_list")} :\n\`${wordsList.map(row => row.word).join("`, `")}\`` : t("no_banwords_for_now") + " " + t("common:kirino_glad")))
        }

        else if (subcommand === "remove") {
            const word = parseEmoji(interaction.options.getString("word") as string)

            const banwords = bot.db.prepare("SELECT * FROM banwords WHERE guild_id = ?").all(interaction.guild?.id) as Banword[]
            if (banwords.map(row => row.word).includes(word)) {
                bot.db.prepare("DELETE FROM banwords WHERE guild_id = ? AND word = ?").run(interaction.guild?.id, word)
                interaction.reply(`${t("word_removed_from_banword", { word })} ${t("common:kirino_glad")}`)
            }
            else {
                interaction.reply({ content: `${t("word_not_found_in_banwords")} ${t("common:kirino_glad")}`, ephemeral: true })
            }
        }
    }
}