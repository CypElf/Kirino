const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ask")
        .setDescription(__("description_ask"))
        .addStringOption(option => option.setName("question").setDescription("The question you want to ask").setRequired(true)),
    guildOnly: false,
    cooldown: 1,

    async execute(bot, interaction) {
        const possibleAnswers = [__("Yes."), __("No."), __("maybe"), __("surely"), __("probably"), __("surely_not"), __("not_at_all"), __("i_do_not_think"), __("you_should_take_a_break"), __("do_not_want_to_answer"), __("clearly_not"), __("they_whisper_yes"), __("they_whisper_no"), __("idk")]

        if (getLocale() === "fr") possibleAnswers.push(__("ptdr_t_ki"))

        const choice = Math.floor(Math.random() * (possibleAnswers.length))
        interaction.reply(`Question : ${interaction.options.getString("question")}\nAnswer : ${possibleAnswers[choice].toLowerCase()}`)
    }
}