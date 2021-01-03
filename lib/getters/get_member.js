async function getMember(msg, args) {
    member = msg.mentions.members.first()
    if (member === undefined) {
        let userInput = args.join(" ").toLowerCase()

        if (member === undefined) {
            try {
                member = await msg.guild.members.fetch(userInput)
            }
            catch {
                members = await msg.guild.members.fetch({ query: userInput, limit: 10 })
                members = members.array()
                if (members.length == 1) member = members[0]
                else if (members.length > 1) {
                    for (const currentMember of members) {
                        if (currentMember.user.username.toLowerCase() === userInput || currentMember.nickname && currentMember.nickname.toLowerCase() === userInput) {
                            member = currentMember
                            break
                        }
                    }

                    if (member === undefined) {
                        const printableResults = members.map((currentMember, i) => (i + 1) + " - " + currentMember.user.username).join("\n")
                        const choicesMsg = await msg.channel.send(`${__("i_found")} ${members.length} ${__("members_who_do_you_want")}\n${printableResults}\nN - ${__("nothing")}`)
    
                        const filter = cMsg => cMsg.author.id === msg.author.id && cMsg.content.toUpperCase() === "N" || (!isNaN(cMsg.content) && cMsg.content > 0 && cMsg.content <= members.length)
                        try {
                            let cMsg = await msg.channel.awaitMessages(filter, { max: 1, time: 30_000 })
                            cMsg = cMsg.array()
                            if (cMsg.length === 1) {
                                if (cMsg[0].content.toUpperCase() !== "N") member = members[cMsg[0].content - 1]
                                else member = undefined
    
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

module.exports = getMember