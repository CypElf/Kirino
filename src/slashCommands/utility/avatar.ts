import { SlashCommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"
import { Kirino } from "../../lib/misc/types"

export default {
    data: new SlashCommandBuilder()
        .setName("avatar")
        .setDescription("Display the avatar of a user")
        .addUserOption(option => option.setName("user").setDescription("The user you want to get the avatar")),
    guildOnly: false,

    async execute(bot: Kirino, interaction: CommandInteraction) {
        const user = interaction.options.getUser("user") ?? interaction.user

        interaction.reply(user.displayAvatarURL({
            dynamic: true,
            size: 4096
        }))
    }
}