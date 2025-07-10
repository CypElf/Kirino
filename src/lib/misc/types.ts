import { ChatInputCommandInteraction, Client, ClientOptions, Collection, RESTPostAPIChatInputApplicationCommandsJSONBody } from "discord.js"
import fs from "fs"
import { Job } from "node-schedule"
import { Database } from "bun:sqlite"

export interface KirinoCommandBuilder {
    toJSON(): RESTPostAPIChatInputApplicationCommandsJSONBody
}

export interface KirinoCommand {
    builder: KirinoCommandBuilder,
    name?: string,
    category?: string,
    execute(bot: Kirino, interaction: ChatInputCommandInteraction): Promise<unknown>
}

export interface KirinoCommandWithMetadata extends KirinoCommand {
    name: string,
    category: string
}

export interface CommandFileObject {
    command: KirinoCommand
}

export class Kirino extends Client {
    commands: Collection<string, KirinoCommandWithMetadata>
    db: Database
    xpCooldowns: Collection<string, Collection<string, number>>
    apiCooldowns: Map<string, number>
    calls: Collection<string, number>
    birthdaysJobs: Collection<string, Job>

    constructor(options: ClientOptions) {
        super(options)
        this.commands = new Collection()
        this.xpCooldowns = new Collection()
        this.apiCooldowns = new Map()
        this.calls = new Collection()
        this.birthdaysJobs = new Collection()

        // Create database from schema if it doesn't exist
        if (!fs.existsSync(__dirname + "/../../../database.db")) {
            if (!fs.existsSync(__dirname + "/../../../database.sql")) {
                throw new Error("The database schema file, database.sql, is missing in the project root.")
            }
            const schema = fs.readFileSync(__dirname + "/../../../database.sql", "utf-8")
            const db = new Database(__dirname + "/../../../database.db")
            db.exec(schema)
            db.close()
        }

        this.db = new Database(__dirname + "/../../../database.db")
    }
}