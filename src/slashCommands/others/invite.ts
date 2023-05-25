import { SlashCommandBuilder } from "@discordjs/builders"
import { CommandInteraction, MessageEmbed } from "discord.js"
import i18next from "i18next"
import { Kirino } from "../../lib/misc/types"

const t = i18next.t.bind(i18next)

export default {
    data: new SlashCommandBuilder()
        .setName("invite")
        .setDescription("Give you the link to invite me to a new Discord server"),
    guildOnly: false,

    async execute(bot: Kirino, interaction: CommandInteraction) {
        const invite = new MessageEmbed()
            .addFields({ name: `${t("invite_bot")} **${bot.user?.username}** ${t("on_a_server")}`, value: `${t("the_link_to_invite_me_is_available")} **${t("here")} (${process.env.INVITE_LINK})**` })
            .setColor("#DFC900")
            .setFooter({ text: t("common:request_from", { username: interaction.user.username }), iconURL: interaction.user.avatarURL()?.toString() })

        interaction.reply({ embeds: [invite] })
    }
}