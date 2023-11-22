import { SlashCommandBuilder } from "@discordjs/builders"
import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js"
import i18next from "i18next"
import { Kirino } from "../../lib/misc/types"

const t = i18next.t.bind(i18next)

export const command = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Give you some ways to get help if you need it"),
    guildOnly: false,

    async execute(bot: Kirino, interaction: ChatInputCommandInteraction) {
        const betaCommands = bot.commands.filter(command => command.beta).map(command => command.name)

        const helpEmbed = new EmbedBuilder()
            .setTitle(`**${t("help")}**`)
            .setThumbnail("https://media.discordapp.net/attachments/714381484617891980/878930768959799326/help.png")
            .addFields(
                { name: `**${t("q_and_a")}**\n\u200b`, value: t("q_and_a_content", { invite_link: process.env.INVITE_LINK }) + "\n\u200b" },
                { name: `**${t("beta_commands")}**\n\u200b`, value: betaCommands.length > 0 ? "`" + betaCommands.join("`, `") + "`" : t("no_beta_command") }
            )
            .setColor("#DFC900")
            .setFooter({ text: t("common:request_from", { username: interaction.user.username }), iconURL: interaction.user.displayAvatarURL() })

        interaction.reply({ embeds: [helpEmbed] })
    }
}