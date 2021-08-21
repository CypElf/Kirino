const { SlashCommandBuilder } = require("@discordjs/builders")
const t = require("i18next").t.bind(require("i18next"))
const { deflateSync } = require("zlib")
const fetch = require("node-fetch")
const paste = require("../../lib/misc/paste")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("run")
        .setDescription("Execute a program in any given programming language and display its output")
        .addStringOption(option => option.setName("language").setDescription("The language your code is written in").setRequired(true))
        .addStringOption(option => option.setName("code").setDescription("The code you want to execute").setRequired(true))
        .addStringOption(option => option.setName("input").setDescription("The input you want to send to the program's standard input"))
        .addStringOption(option => option.setName("args").setDescription("The command line arguments you want to send to the program"))
        .addStringOption(option => option.setName("flags").setDescription("The flags you want to submit to the C compiler if used")),
    guildOnly: false,

    async execute(bot, interaction) {
        interaction.deferReply()

        const defaults = new Map(Object.entries({
            asm: "assembly-nasm",
            ada: "ada-gnat",
            apl: "apl-dyalog-classic",
            assembly: "assembly-gcc",
            b: "ybc",
            sh: "bash",
            c: "c-gcc",
            cobol: "cobol-gnu",
            cpp: "cpp-gcc",
            "c++": "cpp-gcc",
            cs: "cs-core",
            csharp: "cs-core",
            "c#": "cs-core",
            erlang: "erlang-escript",
            euphoria: "euphoria4",
            fasm: "assembly-fasm",
            fs: "fs-core",
            "f#": "fs-core",
            fsharp: "fs-core",
            java: "java-jdk",
            javascript: "javascript-node",
            js: "javascript-node",
            node: "javascript-node",
            julia: "julia1x",
            k: "kona",
            "kobeři-c": "koberi-c",
            nasm: "assembly-nasm",
            nimrod: "nim",
            "objective-c": "objective-c-gcc",
            pascal: "pascal-fpc",
            perl: "perl6",
            pilot: "pilot-rpilot",
            postscript: "postscript-xpost",
            py: "python3",
            python: "python3",
            "q#": "qs",
            qs: "qs-core",
            rs: "rust",
            snobol: "snobol4",
            sql: "sqlite",
            u6: "mu6",
            vb: "vb-core"
        }))

        const language = defaults.get(interaction.options.getString("language")) ?? interaction.options.getString("language")
        const code = interaction.options.getString("code")
        const input = interaction.options.getString("input") ?? ""
        const args = interaction.options.getString("args")?.split(" ") ?? []
        const flags = interaction.options.getString("flags")?.split(" ") ?? []

        const tio = new Tio(language, code, input, flags, [], args)

        let data = await tio.send()
        data = data.split("\n").filter(line => !line.startsWith("Real time: ") && !line.startsWith("User time: ") && !line.startsWith("Sys. time: ") && !line.startsWith("CPU share: ")).join("\n")

        if (data.split("\n").length > 30 || data.length > (2000 - 8)) { // - 8 because of "```\n" + data + "\n```" below
            const url = await paste(data)

            if (url === null) interaction.editReply({ content: `I'm sorry, your code output is too big and my attempts to create pastes with your output all failed. ${t("common:kirino_what")}`, ephemeral: true })
            else interaction.editReply(`Output was too big, I pasted it here: ${url} ${t("common:kirino_glad")}`)
        }
        else {
            while (data.includes("```")) data = data.replace("```", "\u200B`\u200B`\u200B`\u200B") // prevent markdown code block end
            data = "```\n" + data + "\n```"

            interaction.editReply(data)
        }
    }
}

class Tio {
    constructor(language, code, input = "", compilerFlags = [], commandLineOptions = [], cli_args = []) {
        const to_bytes = (str) => Buffer.from(str, "utf8")
        const zip = (array1, array2) => array1.map((e, i) => [e, array2[i]])

        function toTioString(couple) {
            const [name, obj] = couple
            if (!obj.length) {
                return to_bytes("")
            }
            else if (typeof obj === "object") {
                const content = ["V" + name, obj.length.toString()].concat(obj)
                return to_bytes(content.join("\x00") + "\x00")
            }
            else {
                return to_bytes(`F${name}\x00${to_bytes(obj).length}\x00${obj}\x00`)
            }
        }

        this.api = "https://tio.run/cgi-bin/run/api/"

        const strings = {
            lang: [language],
            ".code.tio": code,
            ".input.tio": input,
            "TIO_CFLAGS": compilerFlags,
            "TIO_OPTIONS": commandLineOptions,
            args: cli_args
        }

        const bytes = Buffer.concat(zip(Object.keys(strings), Object.values(strings)).map(toTioString).concat([to_bytes("R")]))

        this.request = deflateSync(bytes)
        this.request = this.request.slice(2, this.request.length - 4)
    }

    async send() {
        const res = await fetch(this.api, {
            method: "POST",
            body: this.request,
            headers: { "Content-Type": "application/octet-stream" }
        })

        const buff = await res.buffer()

        let text = buff.toString("utf8")
        const token = text.slice(0, 16)
        text = text.replaceAll(token, "")

        return text
    }
}