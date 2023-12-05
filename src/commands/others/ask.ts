import { SlashCommandBuilder } from "@discordjs/builders"
import { ChatInputCommandInteraction } from "discord.js"
import i18next from "i18next"
import { KirinoCommand, Kirino } from "../../lib/misc/types"

const t = i18next.t.bind(i18next)

export const command: KirinoCommand = {
    builder: new SlashCommandBuilder()
        .setName("ask")
        .setDescription("Answer your question")
        .addStringOption(option => option.setName("question").setDescription("The question you want to ask").setRequired(true)),
    guildOnly: false,
    cooldown: 1,

    async execute(bot: Kirino, interaction: ChatInputCommandInteraction) {
        const possibleAnswers = [t("Yes."), t("No."), t("maybe"), t("surely"), t("probably"), t("surely_not"), t("not_at_all"), t("i_do_not_think"), t("you_should_take_a_break"), t("do_not_want_to_answer"), t("clearly_not"), t("they_whisper_yes"), t("they_whisper_no"), t("idk")]

        if (i18next.language === "fr") possibleAnswers.push(t("ptdr_t_ki"))

        const choice = Math.floor(Math.random() * (possibleAnswers.length))
        interaction.reply(`${t("question")} : ${interaction.options.getString("question")}\n${t("answer")} : ${possibleAnswers[choice].toLowerCase()}`)
    }
}