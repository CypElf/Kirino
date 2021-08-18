require("dotenv").config()

const { REST } = require("@discordjs/rest")
const { Routes } = require("discord-api-types/v9")
const fs = require("fs")
const i18n = require("i18n")
const yaml = require("js-yaml")

i18n.configure({
    locales: ["en", "fr"],
    staticCatalog: {
        en: yaml.safeLoad(fs.readFileSync("./languages/en.yml", "utf-8")),
        fr: yaml.safeLoad(fs.readFileSync("./languages/fr.yml", "utf-8"))
    },
    register: global
})

const commands = []
const categories = fs.readdirSync("./commands")

const clientId = process.env.CLIENT_ID
const guildId = process.env.DEBUG_SERVER_ID

const rest = new REST({ version: "9" }).setToken(process.env.KIRINO_TOKEN)

for (const category of categories) {
    const commandFiles = fs.readdirSync(`./slashCommands/${category}/`).filter(file => file.endsWith(".js"))

    for (const commandFile of commandFiles) {
        // eslint-disable-next-line node/global-require
        const command = require(`./slashCommands/${category}/${commandFile}`)
        commands.push(command.data.toJSON())
    }
}

(async () => {
    try {
        console.log("Started refreshing slash commands")

        if (process.argv.length > 2 && process.argv[2] === "--debug") {
            await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
        }
        else {
            await rest.put(Routes.applicationCommands(clientId), { body: commands })
        }

        console.log("Successfully reloaded slash commands")
    }
    catch (err) {
        console.error(err)
    }
})()