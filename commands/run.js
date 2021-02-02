const { __ } = require("i18n")

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

                while (text.includes(token)) text = text.replace(token, "") // replaceAll is only available in node js 15.0 and later, and the current LTS version is below this

                return text
            }
        }

        const language = args[0].split("\n")[0]

        args = args.join(" ")
        let code = args.split("\n").length > 1 ? args.split("\n").slice(1).join("\n") : args.split(" ").slice(1).join(" ")

        if (code.split("\n")[0].split(" ").length === 1 && code.startsWith("```")) code = code.split("\n").slice(1).join("\n")
        else if (code.startsWith("```")) code = code.slice(3)
        if (code.endsWith("```")) code = code.slice(0, code.length - 3)
       
        const tio = new Tio(language, code)

        let data = await tio.send()

        data = data.split("\n").filter(line => !line.startsWith("Real time") && !line.startsWith("User time") && !line.startsWith("Sys. time") && !line.startsWith("CPU share")).join("\n")

        msg.channel.send(data)
	}
}