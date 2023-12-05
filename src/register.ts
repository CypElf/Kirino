import { REST, RESTPostAPIChatInputApplicationCommandsJSONBody, Routes } from "discord.js"
import dotenv from "dotenv"
import path from "path"
import fs from "fs"
import { CommandFileObject } from "./lib/misc/types"

dotenv.config()

async function register() {
    const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = []
    const categories = fs.readdirSync(path.join(__dirname, "/commands"))

    const clientId = process.env.CLIENT_ID
    const guildId = process.env.DEBUG_SERVER_ID
    const token = process.env.KIRINO_TOKEN

    if (!token) throw new Error("Token not found in env.")
    if (!clientId) throw new Error("Client ID not found in env.")
    if (!guildId) throw new Error("Debug server ID not found in env.")

    const rest = new REST().setToken(token)

    for (const category of categories) {
        const commandFiles = fs.readdirSync(path.join(__dirname, "commands", category)).filter(file => file.endsWith(".js"))

        for (const commandFile of commandFiles) {
            const { command }: CommandFileObject = await import(path.join(__dirname, "commands", category, commandFile))
            commands.push(command.builder.toJSON())
        }
    }

    try {
        console.log("Registering slash commands...")
        const refreshProdCommands = process.argv.length <= 2 || process.argv[2] !== "--debug"

        if (refreshProdCommands) {
            await rest.put(Routes.applicationCommands(clientId), { body: commands })
        }

        await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })

        console.log(`${refreshProdCommands ? "Production and debug" : "Debug"} slash commands successfully registered.`)
    }
    catch (err) {
        console.error(err)
    }
}

register()