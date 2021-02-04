module.exports = {
	name: "run",
    guildOnly: false,
	args: true,
    category: "programming",

    async execute (bot, msg, args) {
        if (args.length < 2 && args.join(" ").split("\n").length < 2) return msg.channel.send(`${__("run_need_two_args")} ${__("kirino_pout")}`)

        const { deflateSync } = require("zlib")

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
                this.available = "https://tio.run/languages.json"

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
                const fetch = require("node-fetch")

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

        if (language.startsWith("```")) {
            language = language.slice(3)
        }

        args = args.join(" ")
        let code = args.split("\n").length > 1 ? args.split("\n").slice(1).join("\n") : args.split(" ").slice(1).join(" ")

        const inputs = []
        code = code.split("\n").filter(line => {
            if (line.slice(0, 6) === "input " && line.length > 6) {
                let input = line.slice(6)
                if (input.startsWith("`") && input.endsWith("`")) input = input.slice(1, input.length - 1)
                inputs.push(input)
                return false
            }
            return true
        }).join("\n")

        if (code.split("\n")[0].split(" ").length === 1 && code.startsWith("```")) code = code.split("\n").slice(1).join("\n")
        else if (code.startsWith("```")) code = code.slice(3)
        if (code.endsWith("```")) code = code.slice(0, code.length - 3)
       
        const tio = new Tio(language, code, inputs.join("\n"))

        msg.channel.startTyping()

        let data = await tio.send()
        data = data.split("\n").filter(line => !line.startsWith("Real time: ") && !line.startsWith("User time: ") && !line.startsWith("Sys. time: ") && !line.startsWith("CPU share: ")).join("\n")

        if (data.split("\n").length > 30 || data.length > (2000 - 8)) { // - 8 because of "```\n" + data + "\n```" below
            const paste = require("../lib/misc/paste")
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