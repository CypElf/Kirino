import { Client, ClientOptions, Collection } from "discord.js"
import bsqlite3 from "better-sqlite3"

export class Kirino extends Client {
    commands: Collection<string, any>
    db: bsqlite3.Database
    commandsCooldowns: Collection<string, Collection<string, number>>
    xpCooldowns: Collection<string, Collection<string, number>>
    apiCooldowns: Map<string, number>
    voicesQueues: Collection<string, any>
    calls: Collection<string, any>

    constructor(options: ClientOptions) {
        super(options)
        this.commands = new Collection()
        this.db = new bsqlite3(__dirname + "../../../../database.db", { fileMustExist: true })
        this.commandsCooldowns = new Collection()
        this.xpCooldowns = new Collection()
        this.apiCooldowns = new Map()
        this.voicesQueues = new Collection()
        this.calls = new Collection()
    }
}