module.exports = {
	name: "guilds",
    guildOnly: false,
    args: false,
    category: "ignore",

    async execute (bot, msg, args) {
        if (bot.config.ownerID === msg.author.id) {
            let allInvites = ""
            for (const guild of bot.guilds.cache.array()) {
                allInvites += `- ${guild.name} :\n\n`
                try {
                    let guildInvites = await guild.fetchInvites()
                    let invitesArray = guildInvites.array().map(guildInvite => {
                        return "https://discord.gg/" + guildInvite.code
                    })
                    let invites
                    if (invitesArray.length === 0) invites = __("no_invit_available")
                    else invites = invitesArray.join("\n")
                    allInvites += invites + "\n\n"
                }
                catch (err) {
                    allInvites += __("missing_permissions_to_get_invits") + "\n\n"
                }
            }

            const querystring = require("querystring")
            const fetch = require("node-fetch")
        
            const query = querystring.stringify({
                api_paste_code: allInvites,
                api_paste_name: __("invitations").substring(0, __("invitations").length - 2),
                api_paste_private: 1,
                api_paste_expire_date: "1D",
                api_dev_key: process.env.PASTEBIN_DEV_KEY,
                api_option: "paste",
            })
        
            let answer = await fetch("https://pastebin.com/api/api_post.php", {
                method: "POST",
                headers: {
                    'Content-Type': "application/x-www-form-urlencoded",
                    'Content-Length': query.length
                },
                body: query
            })
            
            answer = await answer.text()
            msg.channel.send(answer)
        }
    }
}