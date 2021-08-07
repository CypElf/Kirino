module.exports = {
	name: "run",
    guildOnly: false,
	args: true,
    aliases: ["execute", "exe"],

    async execute (bot, msg, args) {

        const fetch = require("node-fetch")
        const { deflateSync } = require("zlib")

        const defaults = new Map(Object.entries({
            asm: "assembly-nasm",
            ada: 'ada-gnat',
            apl: 'apl-dyalog-classic',
            assembly: 'assembly-gcc',
            b: 'ybc',
            sh: 'bash',
            c: 'c-gcc',
            cobol: 'cobol-gnu',
            cpp: 'cpp-gcc',
            "c++": 'cpp-gcc',
            cs: 'cs-core',
            csharp: 'cs-core',
            "c#": 'cs-core',
            erlang: 'erlang-escript',
            euphoria: 'euphoria4',
            fasm: 'assembly-fasm',
            fs: 'fs-core',
            "f#": 'fs-core',
            fsharp: 'fs-core',
            java: 'java-jdk',
            javascript: 'javascript-node',
            js: 'javascript-node',
            node: "javascript-node",
            julia: 'julia1x',
            k: 'kona',
            "kobeři-c": 'koberi-c',
            nasm: 'assembly-nasm',
            nimrod: 'nim',
            "objective-c": 'objective-c-gcc',
            pascal: 'pascal-fpc',
            perl: 'perl6',
            pilot: 'pilot-rpilot',
            postscript: 'postscript-xpost',
            py: 'python3',
            python: 'python3',
            'q#': 'qs',
            qs: 'qs-core',
            rs: 'rust',
            snobol: 'snobol4',
            sql: 'sqlite',
            u6: 'mu6',
            vb: 'vb-core',
        }))

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

        class Tio {
            constructor(language, code, input = "", compilerFlags = [], commandLineOptions = [], args = []) {
                this.api = "https://tio.run/cgi-bin/run/api/"

                const strings = {
                    lang: [language],
                    ".code.tio": code,
                    ".input.tio": input,
                    "TIO_CFLAGS": compilerFlags,
                    "TIO_OPTIONS": commandLineOptions,
                    args
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

                while (text.includes(token)) text = text.replace(token, "") // replaceAll is only available in Node.js 15.0 and later, and the current LTS version is below this

                return text
            }
        }

        let language = args[0].split("\n")[0]
        if (language.startsWith("```")) language = language.slice(3) // if no language is provided explicitely and a language is added to a markdown code block, infer its 
        if (defaults.has(language)) language = defaults.get(language)

        args = args.join(" ")
        let code = args.split("\n").length > 1 ? args.split("\n").slice(1).join("\n") : args.split(" ").slice(1).join(" ")

        const inputs = []
        const cmdArgs = []
        const flags = []
        code = code.split("\n").filter(line => {
            if (line.slice(0, 6) === "input " && line.length > 6) {
                let input = line.slice(6)
                if (input.startsWith("`") && input.endsWith("`")) input = input.slice(1, input.length - 1)
                inputs.push(input)
                return false
            }
            else if (line.slice(0, 5) === "args " && line.length > 5) {
                let args = line.slice(5)
                if (args.startsWith("`") && args.endsWith("`")) args = args.slice(1, args.length - 1)
                args.split(" ").map(arg => cmdArgs.push(arg))
                return false
            }
            else if (line.slice(0, 6) === "flags " && line.length > 6) {
                let flag = line.slice(6)
                if (flag.startsWith("`") && flag.endsWith("`")) flag = flag.slice(1, flag.length - 1)
                flag.split(" ").map(f => flags.push(f))
                return false
            }
            return true
        }).join("\n")

        let gotFromAttachment = false
        if (msg.attachments.size > 0) {
            const attachment = [...msg.attachments.values()][0]
            if (attachment.size > 4000000) return msg.channel.send(`${__("file_too_big")} (> 4 Mo). ${__("kirino_pout")}`)
            const res = await fetch(attachment.url)
            if (res.ok) {
                code = await res.text()
                gotFromAttachment = true
            }
        }

        if (!gotFromAttachment) {
            if (code.split("\n")[0].split(" ").length === 1 && code.startsWith("```")) code = code.split("\n").slice(1).join("\n") // remove the markdown code block header with a specified language
            else if (code.startsWith("```")) code = code.slice(3) // remove the markdown code block header without a specified language
            if (code.endsWith("```")) code = code.slice(0, code.length - 3) // remove the markdown code block footer
        }

        if (language === "") return msg.channel.send(__(`${__("language_empty")} ${__("kirino_pff")}`))
        if (code === "") return msg.channel.send(__(`${__("code_empty")} ${__("kirino_pff")}`))
       
        const tio = new Tio(language, code, inputs.join("\n"), flags, [] ,cmdArgs)

        msg.channel.startTyping()

        let data = await tio.send()
        data = data.split("\n").filter(line => !line.startsWith("Real time: ") && !line.startsWith("User time: ") && !line.startsWith("Sys. time: ") && !line.startsWith("CPU share: ")).join("\n")

        if (data.split("\n").length > 30 || data.length > (2000 - 8)) { // - 8 because of "```\n" + data + "\n```" below
            const paste = require("../../lib/misc/paste")
            const url = await paste(data)
            
            msg.channel.stopTyping()
            
            if (url === null) msg.channel.send(`I'm sorry, your code output is too big and my attempts to create pastes with your output all failed. ${__("kirino_what")}`)
            else msg.channel.send(`Output was too big, I pasted it here: ${url} ${__("kirino_glad")}`)
        }
        else {
            while (data.includes("```")) data = data.replace("```", "\u200B`\u200B`\u200B`\u200B") // prevent markdown code block end
            data = "```\n" + data + "\n```"

            msg.channel.stopTyping()
            msg.channel.send(data)
        }
	}
}