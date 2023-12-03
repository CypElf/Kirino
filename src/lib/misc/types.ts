import { ChatInputCommandInteraction, Client, ClientOptions, Collection } from "discord.js"
import bsqlite3 from "better-sqlite3"

export interface Command {
    name: string,
    category: string,
    cooldown: number | undefined,
    guildOnly: boolean,
    execute(bot: Kirino, interaction: ChatInputCommandInteraction): Promise<void>
}

export class Kirino extends Client {
    commands: Collection<string, Command>
    db: bsqlite3.Database
    commandsCooldowns: Collection<string, Collection<string, number>>
    xpCooldowns: Collection<string, Collection<string, number>>
    apiCooldowns: Map<string, number>
    calls: Collection<string, number>

    constructor(options: ClientOptions) {
        super(options)
        this.commands = new Collection()
        this.db = new bsqlite3(__dirname + "/../../../database.db", { fileMustExist: true })
        this.commandsCooldowns = new Collection()
        this.xpCooldowns = new Collection()
        this.apiCooldowns = new Map()
        this.calls = new Collection()
    }
}
