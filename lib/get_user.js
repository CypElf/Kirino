async function getUser(msg, args) {
    member = msg.mentions.members.first()
    if (member === undefined) {
        let usernameOrID = args.join(" ")
        member = msg.guild.members.cache.array().find(currentMember => {
            if (currentMember.nickname) return currentMember.nickname.toLowerCase() === usernameOrID.toLowerCase()
            else return false
        })
        if (member === undefined) {
            member = msg.guild.members.cache.array().find(currentMember => currentMember.user.username.toLowerCase() === usernameOrID.toLowerCase())
            if (member === undefined) {
                member = msg.guild.members.cache.array().find(currentMember => currentMember.id === usernameOrID)

                if (member === undefined) {
                    let results = msg.guild.members.cache.array().filter(member => member.user.username.toLowerCase().indexOf(usernameOrID.toLowerCase()) >= 0).slice(0, 10)
                    
                    if (results.length === 1) member = results[0]
                    else if (results.length > 1) {
                        const printableResults = results.map((member, i) => (i + 1) + " - " + member.user.username).join("\n")
                        const choicesMsg = await msg.channel.send(`${__("i_found")} ${results.length} ${__("members_who_do_you_want")}\n${printableResults}\nN - ${__("nobody")}`)

                        const filter = cMsg => cMsg.author.id === msg.author.id && cMsg.content.toUpperCase() === "N" || (!isNaN(cMsg.content) && cMsg.content > 0 && cMsg.content <= results.length)
                        try {
                            let cMsg = await msg.channel.awaitMessages(filter, { max: 1, time: 30_000 })
                            cMsg = cMsg.array()
                            if (cMsg.length === 1) {
                                if (cMsg[0].content.toUpperCase() !== "N") member = results[cMsg[0].content - 1]

                                cMsg[0].delete().catch(() => {})
                            }
                        }
                        catch {}

                        choicesMsg.delete().catch(() => {})
                    }
                }
            }
        }
    }

    return member
}

module.exports = getUser;