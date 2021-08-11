module.exports = {
    name: "purge",
    guildOnly: true,
    args: true,
    aliases: ["clear"],
    permissions: ["manage messages"],

    async execute(bot, msg, args) {
        const { Permissions } = require("discord.js")
        if (!msg.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
            return msg.channel.send(`${__("you_cannot_delete_messages")} ${__("kirino_pff")}`)
        }

        const count = parseInt(args[0]) + 1
        if (isNaN(count)) {
            return msg.channel.send(`${__("please_insert_only_a_number")} ${__("kirino_pout")}`)
        }

        msg.channel.bulkDelete(parseInt(args[0]) + 1)
            .catch(() => {
                return msg.channel.send(`${__("purge_does_not_work_beyond_14_days")} ${__("kirino_pout")}`)
            })
    }
}