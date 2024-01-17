import fetch from "node-fetch"

export default async function paste(content: string) {
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
        return null
    }
}