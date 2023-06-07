import { SlashCommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"
import i18next from "i18next"
import { Kirino } from "../../lib/misc/types"
import { success } from "../../lib/misc/format"
import { XpGuild } from "../../lib/misc/database"

const t = i18next.t.bind(i18next)

export const command = {
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

    async execute(bot: Kirino, interaction: CommandInteraction) {
        const isEnabled = (bot.db.prepare("SELECT is_enabled FROM xp_guilds WHERE guild_id = ?").get(interaction.guild?.id) as XpGuild | null)?.is_enabled
        if (!isEnabled) return interaction.reply({ content: `${t("xp_disabled")} ${t("common:kirino_pout")}`, ephemeral: true })

        if (interaction.options.getSubcommand() === "set") {
            const scale = parseFloat(interaction.options.getString("factor") as string)
            bot.db.prepare("INSERT INTO xp_guilds(guild_id, is_enabled, scale) VALUES(?,?,?) ON CONFLICT(guild_id) DO UPDATE SET scale=excluded.scale").run(interaction.guild?.id, 1, scale === 1 ? null : scale)

            interaction.reply(success(`${t("scale_set")} \`${scale}\`.`))
        }

        else {
            const scale = (bot.db.prepare("SELECT scale FROM xp_guilds WHERE guild_id = ?").get(interaction.guild?.id) as XpGuild | null)?.scale
            interaction.reply(success(`${t("current_scale_is")} \`${scale ? scale : 1}\`.`))
        }
    }
}