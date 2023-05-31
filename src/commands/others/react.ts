import { SlashCommandBuilder } from "@discordjs/builders"
import { CommandInteraction, GuildMember, Message, Permissions } from "discord.js"
import i18next from "i18next"
import { Kirino } from "../../lib/misc/types"

const t = i18next.t.bind(i18next)

export const command = {
    data: new SlashCommandBuilder()
        .setName("react")
        .setDescription("Make me react to a message")
        .addStringOption(option => option.setName("message_id").setDescription("The ID of the message you want me to react to").setRequired(true))
        .addStringOption(option => option.setName("emoji").setDescription("The emoji you want to me react with").setRequired(true)),
    guildOnly: false,
    permissions: ["administrator"],

    async execute(bot: Kirino, interaction: CommandInteraction) {
        if (!interaction.channel) return
        const member = interaction.member as GuildMember | null

        if (interaction.user.id !== process.env.OWNER_ID && member && !member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
            return interaction.reply({ content: `${t("not_allowed_to_use_this_command")} ${t("common:kirino_pff")}`, ephemeral: true })
        }

        if (interaction.guild && interaction.guild.me && !interaction.guild.me.permissions.has(Permissions.FLAGS.ADD_REACTIONS)) {
            return interaction.reply({ content: `${t("cannot_react_to_messages")} ${t("common:kirino_pout")}`, ephemeral: true })
        }

        const message_id = interaction.options.getString("message_id") as string
        const emoji = interaction.options.getString("emoji") as string

        const msg = await interaction.channel.messages.fetch(message_id)
            .catch(() => {
                return interaction.reply({ content: t("bad_message_id") + " " + t("common:kirino_pout"), ephemeral: true })
            }) as Message

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
                return interaction.reply({ content: t("access_to_emoji_denied") + " " + t("common:kirino_pout"), ephemeral: true })
            }
        }

        interaction.reply({ content: `${t("reaction_added")} ${t("common:kirino_glad")}`, ephemeral: true })
    }
}