import { GatewayIntentBits } from "discord.js"
import dotenv from "dotenv"
import path from "path"
import fs from "fs"
import i18next from "i18next"
import Backend from "i18next-fs-backend"
import { Kirino, CommandFileObject } from "./lib/misc/types"
import { startXpApi } from "./lib/api/api"

dotenv.config()

const bot = new Kirino({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions
] })

async function main() {
    i18next.use(Backend).init({
        lng: "en",
        fallbackLng: "en",
        supportedLngs: ["en", "fr"],
        ns: ["common", "interactionCreate", "messageCreate"],
        defaultNS: "common",
        preload: fs.readdirSync(path.join(__dirname, "..", "languages")),
        backend: {
            loadPath: path.join(__dirname, "..", "languages", "{{lng}}", "{{ns}}.yml"),
            addPath: path.join(__dirname, "..", "languages", "{{lng}}", "{{ns}}.missing.yml")
        }
    })

    const eventsFiles = fs.readdirSync(path.join(__dirname, "events")).filter(file => file.endsWith(".js"))
    for (const file of eventsFiles) {
        const { eventHandler } = await import(path.join(__dirname, "events", file))
        eventHandler(bot)
    }

    const categories = fs.readdirSync(path.join(__dirname, "commands"))

    for (const category of categories) {
        const commandFiles = fs.readdirSync(path.join(__dirname, "commands", category)).filter(file => file.endsWith(".js"))
        for (const commandFile of commandFiles) {
            const { command }: CommandFileObject = await import(path.join(__dirname, "commands", category, commandFile))

            const commandName = command.builder.toJSON().name
            bot.commands.set(commandName, { ...command, name: commandName, category })
        }
    }

    process.on("unhandledRejection", error => {
        console.error("Unhandled promise rejection:", error)
    })

    if (!process.env.KIRINO_TOKEN) throw new Error("No token provided, please check your env.")
    await bot.login(process.env.KIRINO_TOKEN)

    startXpApi(bot)
}

main()