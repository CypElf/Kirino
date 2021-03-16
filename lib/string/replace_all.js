function replaceAll(string, toBeReplaced, toBeAdded) {
    while (string.includes(toBeReplaced)) {
        string = string.replace(toBeReplaced, toBeAdded)
    }
    return string
}

module.exports = replaceAll