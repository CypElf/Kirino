import { ChatInputCommandInteraction, Client, ClientOptions, Collection, RESTPostAPIChatInputApplicationCommandsJSONBody } from "discord.js"
import bsqlite3 from "better-sqlite3"

export interface KirinoCommandBuilder {
    toJSON(): RESTPostAPIChatInputApplicationCommandsJSONBody
}

export interface KirinoCommand {
    builder: KirinoCommandBuilder,
    name?: string,
    category?: string,
    permissions?: string[],
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
    db: bsqlite3.Database
    xpCooldowns: Collection<string, Collection<string, number>>
    apiCooldowns: Map<string, number>
    calls: Collection<string, number>

    constructor(options: ClientOptions) {
        super(options)
        this.commands = new Collection()
        this.db = new bsqlite3(__dirname + "/../../../database.db", { fileMustExist: true })
        this.xpCooldowns = new Collection()
        this.apiCooldowns = new Map()
        this.calls = new Collection()
    }
}
