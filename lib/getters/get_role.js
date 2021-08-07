async function getRole(msg, args) {
    let role = msg.mentions.roles.first()
    if (role === undefined) {
        let roleNameOrID = args.join(" ")
        const roles = [...msg.guild.roles.cache.values()]
        role = roles.find(currentRole => currentRole.name.toLowerCase() === roleNameOrID.toLowerCase())
        if (role === undefined) {
            role = roles.find(currentRole => currentRole.id === roleNameOrID)

            if (role === undefined) {
                let results = roles.filter(role => role.name.toLowerCase().indexOf(roleNameOrID.toLowerCase()) >= 0 && role.name !== "@everyone").slice(0, 10)
                
                if (results.length === 1) role = results[0]
                else if (results.length > 1) {
                    const printableResults = results.map((role, i) => (i + 1) + " - " + role.name).join("\n")
                    const choicesMsg = await msg.channel.send(`${__("i_found")} ${results.length} ${__("roles_who_do_you_want")}\n${printableResults}\nN - ${__("nothing")}`)

                    const filter = cMsg => cMsg.author.id === msg.author.id && cMsg.content.toUpperCase() === "N" || (!isNaN(cMsg.content) && cMsg.content > 0 && cMsg.content <= results.length)
                    try {
                        let cMsg = await msg.channel.awaitMessages(filter, { max: 1, time: 30_000 })
                        cMsg = [...cMsg.values()]
                        if (cMsg.length === 1) {
                            if (cMsg[0].content.toUpperCase() !== "N") role = results[cMsg[0].content - 1]

                            cMsg[0].delete().catch(() => {})
                        }
                    }
                    catch {}

                    choicesMsg.delete().catch(() => {})
                }
            }
        }
    }

    return role
}

module.exports = getRole