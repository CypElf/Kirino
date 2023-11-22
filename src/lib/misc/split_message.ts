// copied from discord.js v13 Util class source code (removed in discord.js v14) and a little bit edited
export default function splitMessage(text: string, { maxLength = 2000, char = "\n", prepend = "", append = "" } = {}) {
    if (text.length <= maxLength) return [text]
    const splitText = text.split(char)
    if (splitText.length === 1) throw new RangeError("SPLIT_MAX_LEN")
    const messages = []
    let msg = ""
    for (const chunk of splitText) {
        if (msg && (msg + char + chunk + append).length > maxLength) {
            messages.push(msg + append)
            msg = prepend
        }
        msg += (msg && msg !== prepend ? char : "") + chunk
    }
    return messages.concat(msg).filter(m => m)
}