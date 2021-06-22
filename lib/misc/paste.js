async function paste(content) {
    // return a string that contains the paste URL if successful, otherwise return null
    const fetch = require("node-fetch")
                
    try {
        const res = await fetch("https://hastebin.com/documents", {
            method: "POST",
            body: content
        })

        if (!res.ok) throw "Request to hastebin failed"

        const { key } = JSON.parse(await res.text())
        return `https://hastebin.com/${key}`
    }
    catch {
        const params = new URLSearchParams()
        params.set("code", content)

        try {
            const res = await fetch("https://bin.readthedocs.fr/new", {
                method: "POST",
                body: params
            })

            if (!res.ok) throw "Request to readthedocs failed"

            return res.url
        }
        
        catch {
            return null // both post requests failed
        }
    }
}

module.exports = paste