import { SlashCommandBuilder } from "@discordjs/builders"
import { CommandInteraction, MessageEmbed } from "discord.js"
import i18next from "i18next"
import { Kirino } from "../../lib/misc/types"

const t = i18next.t.bind(i18next)

export const command = {
    data: new SlashCommandBuilder()
        .setName("codeblock")
        .setDescription("Tell you how to send a block of code with appropriate syntax highlighting on Discord"),
    guildOnly: false,

    async execute(bot: Kirino, interaction: CommandInteraction) {
        const linksEmbed = new MessageEmbed()
            .setTitle(t("send_code"))
            .setDescription(t("explanation_code"))
            .setThumbnail("https://cdn.discordapp.com/attachments/698105563485044748/712574232147656704/712320080884793537.png")
            .setImage("https://cdn.discordapp.com/attachments/698105563485044748/712577943666294814/unknown.png")
            .setColor("#000000")
            .setFooter({ text: t("common:request_from", { username: interaction.user.username }), iconURL: interaction.user.displayAvatarURL() })

        interaction.reply({ embeds: [linksEmbed] })
    }
}