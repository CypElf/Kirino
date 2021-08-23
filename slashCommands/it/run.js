const { SlashCommandBuilder } = require("@discordjs/builders")
const i18next = require("i18next")
const t = i18next.t.bind(i18next)
const { deflateSync } = require("zlib")
const fetch = require("node-fetch")
const paste = require("../../lib/misc/paste")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("run")
        .setDescription("Execute your code in any given programming language and give you the output")
        .addStringOption(option => option.setName("language").setDescription("The language your code is written in").setRequired(true))
        .addStringOption(option => option.setName("input").setDescription("The input you want to send to the program's standard input"))
        .addStringOption(option => option.setName("args").setDescription("The command line arguments you want to send to the program"))
        .addStringOption(option => option.setName("flags").setDescription("The flags you want to submit to the C compiler if used")),
    guildOnly: false,

    async execute(bot, interaction) {
        interaction.reply(`${t("send_your_code")} ${t("common:kirino_glad")}`)
        const replyMsg = await interaction.fetchReply()
        let codeMsg

        const filter = msg => msg.author.id === interaction.user.id
        try {
            const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 60_000, errors: ["time"] })
            codeMsg = [...collected.values()][0]
        }
        catch {
            replyMsg.delete()
            return interaction.followUp({ content: `${t("cancelled")} ${t("common:kirino_pout")}`, ephemeral: true })
        }

        i18next.setDefaultNamespace("run") // in case while we were awaiting for messages another command changed the namespace

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

        let code
        let gotFromAttachment = false

        if (codeMsg.attachments.size > 0) {
            const max_size = 1 // Mo

            const attachment = [...codeMsg.attachments.values()][0]
            if (attachment.size > max_size * 1_000_000) {
                codeMsg.delete()
                return interaction.editReply(`${t("file_too_big", { max_size })} ${__("kirino_pout")}`)
            }
            const res = await fetch(attachment.url)
            if (res.ok) {
                code = await res.text()
                gotFromAttachment = true
            }
        }

        if (!gotFromAttachment) {
            code = codeMsg.content

            if (code.split("\n").length > 1 && code.split("\n")[0].split(" ").length === 1 && code.startsWith("```")) code = code.split("\n").slice(1).join("\n") // remove the markdown code block header with a specified language
            else if (code.startsWith("```")) code = code.slice(3) // remove the markdown code block header without a specified language
            if (code.endsWith("```")) code = code.slice(0, code.length - 3) // remove the markdown code block footer
        }

        const language = defaults.get(interaction.options.getString("language").toLowerCase()) ?? interaction.options.getString("language").toLowerCase()
        const input = interaction.options.getString("input") ?? ""
        const args = interaction.options.getString("args")?.split(" ") ?? []
        const flags = interaction.options.getString("flags")?.split(" ") ?? []

        const tio = new Tio(language, code, input, flags, [], args)

        let data = await tio.send()
        data = data.split("\n").filter(line => !line.startsWith("Real time: ") && !line.startsWith("User time: ") && !line.startsWith("Sys. time: ") && !line.startsWith("CPU share: ")).join("\n")

        if (data.split("\n").length > 30 || data.length > (2000 - 8)) { // - 8 because of "```\n" + data + "\n```" below
            const url = await paste(data)

            if (url === null) {
                replyMsg.delete()
                codeMsg.delete()
                interaction.followUp({ content: `${t("paste_error")} ${t("common:kirino_what")}`, ephemeral: true })
            }
            else codeMsg.reply({ content: `${t("pasted_here")} ${url} ${t("common:kirino_glad")}`, allowedMentions: { repliedUser: false } })
        }
        else {
            // prevent markdown code block within the output by adding zero width spaces between the backticks
            data = "```\n" + data.replaceAll("```", "\u200B`\u200B`\u200B`\u200B") + "\n```"

            codeMsg.reply({ content: data, allowedMentions: { repliedUser: false } })
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