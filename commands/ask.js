module.exports = {
	name: "ask",
    description: "description_ask",
    guildOnly: false,
    args: true,
    category: "others",
    usage: "usage_ask",

    async execute (bot, msg, args) {
        const possibleAnswers = [__("Yes."), __("No."), __("maybe"), __("surely"), __("probably"), __("surely_not"), __("not_at_all"), __("i_do_not_think"), __("you_should_take_a_break"), __("do_not_want_to_answer"), __("who_are_you"), __("clearly_not"), __("they_whisper_yes"), __("they_whisper_no"), __("idk")]

        const choice = Math.floor(Math.random() * (possibleAnswers.length));

        msg.channel.send(possibleAnswers[choice])
    }
}