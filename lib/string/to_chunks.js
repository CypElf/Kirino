function toChunks(string, maxSize = 1024, separator = "\n") {
    const chunks = [""]
    let i = 0

    for (const line of string.split(separator)) {
        if (line.length + separator.length > maxSize) throw String.raw(`Impossible to split the given string in chunks smaller than ${maxSize} characters by using the '${separator}' separator.`)
        if (chunks[i].length + line.length + separator.length > maxSize) chunks[++i] = ""
        if (chunks[i] !== "") chunks[i] += separator
        chunks[i] += line
    }

    return chunks
}

module.exports = toChunks