module.exports = {
    name: "random",
    guildOnly: false,
    args: true,
    aliases: ["rand", "rng"],
    cooldown: 1,

    async execute(bot, msg, args) {
        if (args.length < 2) msg.channel.send(`${__("missing_maximum")} ${__("kirino_pout")}`)
        else {
            const min = Number.parseInt(args[0])
            const max = Number.parseInt(args[1])

            if (isNaN(min) || isNaN(max)) msg.channel.send(`${__("random_not_integers")} ${__("kirino_pout")}`)
            else if (min > max) msg.channel.send(`${__("min_greater_than_max")} ${__("kirino_pout")}`)

            else msg.channel.send(`${__("random_number")} ${Math.floor(Math.random() * (max - min + 1) + min)}. ${__("kirino_glad")}`)
        }
    }
}