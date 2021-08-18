const fs = require("fs")
const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")
const toChunks = require("../../lib/string/to_chunks")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription(__("description_help"))
        .addStringOption(option => option.setName("command").setDescription("The command you want to get help about")),
    guildOnly: false,

    async execute(bot, interaction) {
        const commandOrAlias = interaction.options.getString("command")

        if (!commandOrAlias) {
            const helpEmbed = new MessageEmbed()
                .setColor("#DFC900")
                .setFooter(__("request_from") + interaction.user.username, interaction.user.displayAvatarURL())

            const dataJoined = [...bot.commands.values()]

            const categories = fs.readdirSync("./commands/").filter(category => category !== "ignore")
            for (const category of categories) {
                let commands = `\`${dataJoined.filter(command => command.category === category).map(command => command.name).join("`, `")}\``

                if (commands) {
                    if (category == categories[categories.length - 1]) commands += `\n\n${__("you_can_do")} \`${bot.prefix}help ${__("usage_help")}\` ${__("to_get_infos_on_a_command")}`
                    helpEmbed.addField(__(category), commands)
                }
            }

            interaction.reply({ embeds: [helpEmbed] })
        }

        else {
            let command = bot.commands.get(commandOrAlias) || bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandOrAlias))
            if (command && command.category === "ignore") command = undefined

            if (!command) return interaction.reply({ content: __("this_command_does_not_exist"), ephemeral: true })

            const helpEmbed = new MessageEmbed()
                .setColor("#DFC900")
                .setTitle(`**${__("command")} : ${command.name}**`)
                .setFooter(__("help_footer"), "https://cdn.discordapp.com/attachments/714381484617891980/748487155214712842/d95a24865c58c14548e439defc097222.png")

            if (__(`description_${command.name}`) !== `description_${command.name}`) {

                const descriptions = toChunks(__(`description_${command.name}`))

                for (const descriptionPart of descriptions) {
                    if (descriptionPart === descriptions[0]) helpEmbed.addField(`**${__("description")}**`, descriptionPart)
                    else helpEmbed.addField(`**${__("description_continuation")}**`, descriptionPart)
                }
            }

            helpEmbed.addField(`**${__("available_in_dm")}**`, command.guildOnly ? __("no") : __("yes"))

            if (command.aliases) helpEmbed.addField(`**${__("aliases")}**`, `\`${command.aliases.join("`, `")}\``)

            if (__(`usage_${command.name}`) !== `usage_${command.name}`) helpEmbed.addField(`**${__("usage")}**`, __(`usage_${command.name}`).split("\n").map(usage => usage.startsWith("nocommand ") ? `\`${usage.slice(10)}\`` : `\`${bot.prefix}${command.name} ${usage}\``).join("\n"))

            helpEmbed.addField(`**${__("cooldown")}**`, `\`${command.cooldown !== undefined ? command.cooldown : 2}\``, true)

            if (command.permissions) helpEmbed.addField(`**${__("required_permissions")}**`, `${command.permissions.join(", ")}`, true)
            else helpEmbed.addField(`**${__("required_permissions")}**`, `${__("nothingF")}`, true)

            interaction.reply({ embeds: [helpEmbed] })
        }
    }
}