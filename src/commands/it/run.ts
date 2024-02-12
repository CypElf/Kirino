import { SlashCommandBuilder, ChatInputCommandInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ModalActionRowComponentBuilder, ModalSubmitInteraction, Locale } from "discord.js"
import i18next from "i18next"
import { deflateSync } from "zlib"
import fetch from "node-fetch"
import paste from "../../lib/misc/paste"
import { KirinoCommand, Kirino } from "../../lib/misc/types"
import { success, what } from "../../lib/misc/format"
import { t } from "../../lib/misc/i18n"

export const command: KirinoCommand = {
    builder: new SlashCommandBuilder()
        .setName("run")
        .setDescription("Execute your code in any given programming language and give you the output")
        .addStringOption(option => option.setName("language").setDescription("The language your code is written in").setRequired(true))
        .addStringOption(option => option.setName("input").setDescription("The input you want to send to the program's standard input"))
        .addStringOption(option => option.setName("args").setDescription("The command line arguments you want to send to the program"))
        .addStringOption(option => option.setName("flags").setDescription("The flags you want to submit to the C compiler if used")),

    async execute(bot: Kirino, interaction: ChatInputCommandInteraction) {
        const codeModal = new ModalBuilder()
            .setCustomId("codeModal")
            .setTitle("Code")

        const codeInputField = new TextInputBuilder()
            .setCustomId("codeInputField")
            .setLabel("Enter your code here")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)

        const actionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(codeInputField)
        codeModal.addComponents(actionRow)
        interaction.showModal(codeModal)

        let code: string
        let interaction2: ModalSubmitInteraction
        try {
            interaction2 = await interaction.awaitModalSubmit({ time: 60_000, filter: i => i.user.id === interaction.user.id && i.customId === "codeModal" })
            await interaction2.deferReply()
            code = interaction2.fields.getTextInputValue("codeInputField")
        }
        catch {
            return
        }

        const lang = interaction.locale === Locale.French ? "fr" : "en"
        await i18next.changeLanguage(lang)
        i18next.setDefaultNamespace("run") // in case the namespace changed because another command was run while waiting for the modal to be filled

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

        const userLanguage = interaction.options.getString("language") as string
        const language = defaults.get(userLanguage.toLowerCase()) ?? userLanguage.toLowerCase()
        const input = interaction.options.getString("input") ?? ""
        const args = interaction.options.getString("args")?.split(" ") ?? []
        const flags = interaction.options.getString("flags")?.split(" ") ?? []

        // TIO specifics
        const tioApi = "https://tio.run/cgi-bin/run/api/"

        const strings = {
            lang: [language],
            ".code.tio": code,
            ".input.tio": input,
            "TIO_CFLAGS": flags,
            "TIO_OPTIONS": [],
            args
        }

        const zip = (array1: string[], array2: (string | string[])[]) => array1.map((e, i) => [e, array2[i]])
        const bytes = Buffer.concat(zip(Object.keys(strings), Object.values(strings)).map(toTioString).concat([Buffer.from("R", "utf-8")]))
        const request = deflateSync(bytes).subarray(2, -4)

        const res = await fetch(tioApi, {
            method: "POST",
            body: request,
            headers: { "Content-Type": "application/octet-stream" }
        })

        const respBuff = await res.buffer()
        const respText = respBuff.toString("utf8")
        const token = respText.slice(0, 16)
        const data = respText.replaceAll(token, "")

        // separation of the actual output and the stats provided by TIO
        const output = data.split("\n").slice(0, -5).join("\n")
        const stats = data.split("\n").slice(-5).join("\n")

        const zeroWidthSpace = "\u200B"
        const escapedOutput = output.replaceAll("```", zeroWidthSpace + "`" + zeroWidthSpace + "`" + zeroWidthSpace + "`" + zeroWidthSpace)
        const formattedEscapedOutput = (output.length > 0 ? ("```\n" + escapedOutput + "```") : t("no_output")) + `\n${t("stats")}\n\n${stats}`

        const maxMessageLength = 2000

        // limit to 20 lines for readability
        if (formattedEscapedOutput.length <= maxMessageLength && formattedEscapedOutput.split("\n").length <= 20) {
            interaction2.editReply({ content: formattedEscapedOutput })
        }
        else {
            const url = await paste(output)

            if (url === null) {
                interaction2.editReply({ content: what(t("paste_error")) })
            }
            else interaction2.editReply({ content: success(`${t("pasted_here")} ${url}`) + `\n${t("stats")}\n\n${stats}` })
        }
    }
}

function toTioString(couple: (string | string[])[]) {
    const [name, obj] = couple
    if (!obj.length) {
        return Buffer.from("", "utf-8")
    }
    else if (typeof obj === "object") {
        const content = ["V" + name, obj.length.toString()].concat(obj)
        return Buffer.from(content.join("\x00") + "\x00", "utf-8")
    }
    else {
        return Buffer.from(`F${name}\x00${Buffer.from(obj, "utf-8").length}\x00${obj}\x00`, "utf-8")
    }
}