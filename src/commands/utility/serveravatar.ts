import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js"
import { KirinoCommand, Kirino } from "../../lib/misc/types"
import { error } from "../../lib/misc/format"
import { t } from "../../lib/misc/i18n"

export const command: KirinoCommand = {
    builder: new SlashCommandBuilder()
        .setName("serveravatar")
        .setDescription("Display the image used for the server avatar")
        .setDMPermission(false),

    async execute(bot: Kirino, interaction: ChatInputCommandInteraction) {
        const avatar = interaction.guild?.iconURL({ size: 4096 })
        if (avatar) interaction.reply(avatar)
        else interaction.reply(error(t("no_avatar")))
    }
}