import { SlashCommandBuilder } from "@discordjs/builders"
import { ChatInputCommandInteraction } from "discord.js"
import { KirinoCommand, Kirino } from "../../lib/misc/types"
import { success, what } from "../../lib/misc/format"

export const command: KirinoCommand = {
    builder: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Display my ping in milliseconds"),
    guildOnly: false,

    async execute(bot: Kirino, interaction: ChatInputCommandInteraction) {
        const start = Date.now()
        await interaction.reply(what("ping"))
        interaction.editReply(success("pong") + ` (${Date.now() - start} ms)`)
    }
}