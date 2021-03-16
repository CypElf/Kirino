function to1024Chunks(string, separator = "\n") {
    let chunks = [""]
    let i = 0

    for (const line of string.split(separator)) {
        if (line.length + separator.length > 1024) throw String.raw(`Impossible to split the given string in chunks smaller than 1024 characters by using the '${separator}' separator.`)
        if (chunks[i].length + line.length + separator.length > 1024) chunks[++i] = ""
        if (chunks[i] !== "") chunks[i] += separator
        chunks[i] += line
    }

    return chunks
}

module.exports = to1024Chunks