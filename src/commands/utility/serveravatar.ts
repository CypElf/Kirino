import { SlashCommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"
import i18next from "i18next"
import { Kirino } from "../../lib/misc/types"
import { error } from "../../lib/misc/format"

const t = i18next.t.bind(i18next)

export const command = {
    data: new SlashCommandBuilder()
        .setName("serveravatar")
        .setDescription("Display the image used for the server avatar"),
    guildOnly: true,

    async execute(bot: Kirino, interaction: CommandInteraction) {
        const avatar = interaction.guild?.iconURL({
            dynamic: true,
            size: 4096
        })
        if (avatar) interaction.reply(avatar)
        else interaction.reply(error(t("no_avatar")))
    }
}