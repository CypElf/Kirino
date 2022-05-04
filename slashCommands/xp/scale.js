const { SlashCommandBuilder } = require("@discordjs/builders")
const t = require("i18next").t.bind(require("i18next"))

module.exports = {
    data: new SlashCommandBuilder()
        .setName("scale")
        .setDescription("Change the factor by which the XP you earn gets multiplied")
        .addSubcommand(option => option.setName("get")
            .setDescription("Display the current scale factor of the XP system"))
        .addSubcommand(option => option.setName("set")
            .setDescription("Change the scale factor of the XP system")
            .addStringOption(option => option.setName("factor")
                .setDescription("The factor by which to multiply the amount of XP earned")
                .setRequired(true)
                .addChoices({
                    name: "0.25",
                    value: "0.25"
                }, {
                    name: "0.5",
                    value: "0.5"
                }, {
                    name: "0.75",
                    value: "0.75"
                }, {
                    name: "1",
                    value: "1"
                }, {
                    name: "1.5",
                    value: "1.5"
                }, {
                    name: "2",
                    value: "2"
                }, {
                    name: "2.5",
                    value: "2.5"
                }, {
                    name: "3",
                    value: "3"
                }))),
    guildOnly: true,
    permissions: ["{administrator}"],

    async execute(bot, interaction) {
        const xpActivationRequest = bot.db.prepare("SELECT is_enabled FROM xp_guilds WHERE guild_id = ?")
        let isEnabled = xpActivationRequest.get(interaction.guild.id)
        if (isEnabled) isEnabled = isEnabled.is_enabled
        if (!isEnabled) return interaction.reply(`${t("currently_disabled_enable_with")} \`${bot.prefix}xp enable\`.`)

        if (interaction.options.getSubcommand() === "set") {
            const scale = parseFloat(interaction.options.getString("factor"))
            bot.db.prepare("INSERT INTO xp_guilds(guild_id, is_enabled, scale) VALUES(?,?,?) ON CONFLICT(guild_id) DO UPDATE SET scale=excluded.scale").run(interaction.guild.id, 1, scale === 1 ? null : scale)

            interaction.reply(`${t("scale_set")} \`${scale}\`. ${t("common:kirino_glad")}`)
        }

        else {
            const scale = bot.db.prepare("SELECT scale FROM xp_guilds WHERE guild_id = ?").get(interaction.guild.id).scale
            interaction.reply(`${t("current_scale_is")} \`${scale === null ? 1 : scale}\`. ${t("common:kirino_glad")}`)
        }
    }
}