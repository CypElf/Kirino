import { SlashCommandBuilder } from "@discordjs/builders"
import { ChatInputCommandInteraction } from "discord.js"
import { KirinoCommand, Kirino } from "../../lib/misc/types"

export const command: KirinoCommand = {
    builder: new SlashCommandBuilder()
        .setName("avatar")
        .setDescription("Display the avatar of a user")
        .addUserOption(option => option.setName("user").setDescription("The user you want to get the avatar")),

    async execute(bot: Kirino, interaction: ChatInputCommandInteraction) {
        const user = interaction.options.getUser("user") ?? interaction.user

        interaction.reply(user.displayAvatarURL({ size: 4096 }))
    }
}