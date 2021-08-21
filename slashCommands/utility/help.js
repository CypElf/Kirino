const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")
const fs = require("fs")
const t = require("i18next").t.bind(require("i18next"))
const toChunks = require("../../lib/string/to_chunks")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Give you informations about a commands or all the commands available")
        .addStringOption(option => option.setName("command").setDescription("The command you want to get help about")),
    guildOnly: false,

    async execute(bot, interaction) {
        const commandOrAlias = interaction.options.getString("command")

        if (!commandOrAlias) {
            const helpEmbed = new MessageEmbed()
                .setColor("#DFC900")
                .setFooter(t("request_from") + interaction.user.username, interaction.user.displayAvatarURL())

            const dataJoined = [...bot.commands.values()]

            const categories = fs.readdirSync("./commands/").filter(category => category !== "ignore")
            for (const category of categories) {
                let commands = `\`${dataJoined.filter(command => command.category === category).map(command => command.name).join("`, `")}\``

                if (commands) {
                    if (category == categories[categories.length - 1]) commands += `\n\n${t("you_can_do")} \`${bot.prefix}help ${t("usage_help")}\` ${t("to_get_infos_on_a_command")}`
                    helpEmbed.addField(t(category), commands)
                }
            }

            interaction.reply({ embeds: [helpEmbed] })
        }

        else {
            let command = bot.commands.get(commandOrAlias) || bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandOrAlias))
            if (command && command.category === "ignore") command = undefined

            if (!command) return interaction.reply({ content: t("this_command_does_not_exist"), ephemeral: true })

            const helpEmbed = new MessageEmbed()
                .setColor("#DFC900")
                .setTitle(`**${t("command")} : ${command.name}**`)
                .setFooter(t("help_footer"), "https://cdn.discordapp.com/attachments/714381484617891980/748487155214712842/d95a24865c58c14548e439defc097222.png")

            if (t(`description_${command.name}`) !== `description_${command.name}`) {

                const descriptions = toChunks(t(`description_${command.name}`))

                for (const descriptionPart of descriptions) {
                    if (descriptionPart === descriptions[0]) helpEmbed.addField(`**${t("description")}**`, descriptionPart)
                    else helpEmbed.addField(`**${t("description_continuation")}**`, descriptionPart)
                }
            }

            helpEmbed.addField(`**${t("available_in_dm")}**`, command.guildOnly ? t("no") : t("yes"))

            if (command.aliases) helpEmbed.addField(`**${t("aliases")}**`, `\`${command.aliases.join("`, `")}\``)

            if (t(`usage_${command.name}`) !== `usage_${command.name}`) helpEmbed.addField(`**${t("usage")}**`, t(`usage_${command.name}`).split("\n").map(usage => usage.startsWith("nocommand ") ? `\`${usage.slice(10)}\`` : `\`${bot.prefix}${command.name} ${usage}\``).join("\n"))

            helpEmbed.addField(`**${t("cooldown")}**`, `\`${command.cooldown !== undefined ? command.cooldown : 2}\``, true)

            if (command.permissions) helpEmbed.addField(`**${t("required_permissions")}**`, `${command.permissions.join(", ")}`, true)
            else helpEmbed.addField(`**${t("required_permissions")}**`, `${t("nothingF")}`, true)

            interaction.reply({ embeds: [helpEmbed] })
        }
    }
}