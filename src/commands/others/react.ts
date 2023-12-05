import { SlashCommandBuilder } from "@discordjs/builders"
import { ChatInputCommandInteraction, GuildMember, Message, PermissionFlagsBits } from "discord.js"
import i18next from "i18next"
import { KirinoCommand, Kirino } from "../../lib/misc/types"
import { denied, error, success } from "../../lib/misc/format"

const t = i18next.t.bind(i18next)

export const command: KirinoCommand = {
    builder: new SlashCommandBuilder()
        .setName("react")
        .setDescription("Make me react to a message")
        .addStringOption(option => option.setName("message_id").setDescription("The ID of the message you want me to react to").setRequired(true))
        .addStringOption(option => option.setName("emoji").setDescription("The emoji you want to me react with").setRequired(true)),
    guildOnly: false,
    permissions: ["administrator"],

    async execute(bot: Kirino, interaction: ChatInputCommandInteraction) {
        if (!interaction.channel) return
        const member = interaction.member as GuildMember | null

        if (interaction.user.id !== process.env.OWNER_ID && member && !member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: denied(t("not_allowed_to_use_this_command")), ephemeral: true })
        }

        if (!interaction.guild?.members.me?.permissions.has(PermissionFlagsBits.AddReactions)) {
            return interaction.reply({ content: error(t("cannot_react_to_messages")), ephemeral: true })
        }

        const message_id = interaction.options.getString("message_id") as string
        const emoji = interaction.options.getString("emoji") as string

        let msg: Message

        try {
            msg = await interaction.channel.messages.fetch(message_id)
        }
        catch {
            return interaction.reply({ content: error(t("bad_message_id")), ephemeral: true })
        }

        try {
            await msg.react(emoji) // work only for default emojis
        }
        catch {
            const match = emoji.match(/<:(.*?):[0-9]*>/gm)
            let customEmoji = ""
            if (match) customEmoji = match.map(fullEmoji => fullEmoji.split(":")[2].split(">")[0])[0]

            try {
                await msg.react(customEmoji)
            }
            catch {
                return interaction.reply({ content: error(t("access_to_emoji_denied")), ephemeral: true })
            }
        }

        interaction.reply({ content: success(t("reaction_added")), ephemeral: true })
    }
}