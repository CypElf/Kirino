async function handleXp(bot, msg, obj) {
    if (msg.guild) {
        const Discord = require("discord.js")

        const xpMetadataRequest = bot.db.prepare("SELECT is_enabled, level_up_message FROM xp_guilds WHERE guild_id = ?")
        const xpMetadata = xpMetadataRequest.get(msg.guild.id)
        
        let isEnabled
        let levelUpMsg = null
        if (xpMetadata) {
            isEnabled = xpMetadata.is_enabled
            levelUpMsg = xpMetadata.level_up_message
        }

        const blacklistedRequest = bot.db.prepare("SELECT channel_id FROM xp_blacklisted_channels WHERE guild_id = ?")
        let blacklistedChannels = blacklistedRequest.all(msg.guild.id)
        let isBlacklisted = blacklistedChannels.map(row => row.channel_id).find(channel_id => channel_id === msg.channel.id)
        if (isBlacklisted) isBlacklisted = true

        if (!obj.cooldowns.has(msg.guild.id)) {
            obj.cooldowns.set(msg.guild.id, new Discord.Collection())
        }
        let isReady = true

        const now = Date.now()
        const timestamps = obj.cooldowns.get(msg.guild.id)
        const cooldown = 60_000
        
        if (timestamps.has(msg.author.id)) {
            const expiration = timestamps.get(msg.author.id) + cooldown // 1 minute cooldown
        
            if (now < expiration) {
                isReady = false
            }
        }
    
        timestamps.set(msg.author.id, now)
        setTimeout(() => timestamps.delete(msg.author.id), cooldown)

        if (isEnabled && isReady && !isBlacklisted) {
            const xpRequest = bot.db.prepare("SELECT * FROM xp_profiles WHERE guild_id = ? AND user_id = ?")
            let xpRow = xpRequest.get(msg.guild.id, msg.author.id)

            if (xpRow === undefined) {
                xpRow = { guild_id: msg.guild.id, user_id: msg.author.id, xp: 0, total_xp: 0, level: 0, color: null }
            }
    
            const currentXp = xpRow.xp
            const currentLvl = xpRow.level

            if (currentLvl < 100) {
                const scaleRequest = bot.db.prepare("SELECT scale FROM xp_guilds WHERE guild_id = ?")
                let scale = scaleRequest.get(msg.guild.id).scale
                if (scale === null) scale = 1

                const xpAdded = Math.floor((Math.floor(Math.random() * (25 - 15 + 1)) + 15) * scale) // the xp added to the user is generated between 15 and 25 and multiplied by the server scale

                let newXp = currentXp + xpAdded
                let newTotalXp = xpRow.total_xp + xpAdded
                let newLvl = currentLvl
        
                const nextLevelXp = 5 * (currentLvl * currentLvl) + 50 * currentLvl + 100
        
                if (newXp >= nextLevelXp) {
                    newLvl += 1
                    newXp = newXp - nextLevelXp

                    if (levelUpMsg === null) levelUpMsg = __("default_lvl_up_msg")
                    levelUpMsg = levelUpMsg
                            .replace("{user}", `<@${msg.author.id}>`)
                            .replace("{username}", msg.author.username)
                            .replace("{tag}", msg.author.tag)
                            .replace("{level}", newLvl)
                            .replace("{server}", msg.guild.name)


                    const channelRequest = bot.db.prepare("SELECT level_up_channel_id FROM xp_guilds WHERE guild_id = ?")
                    let channel = channelRequest.get(msg.guild.id).level_up_channel_id
                    
                    function resetLevelUpChannel() {
                        const resetChannelRequest = bot.db.prepare("INSERT INTO xp_guilds(guild_id, is_enabled, level_up_channel_id) VALUES(?,?,?) ON CONFLICT(guild_id) DO UPDATE SET level_up_channel_id=excluded.level_up_channel_id")
                        resetChannelRequest.run(msg.guild.id, 1, null)
                    }

                    if (channel !== null) {
                        const getChannel = require("./get_channel")
                        channel = getChannel(msg, [channel])

                        if (channel === undefined) {
                            resetLevelUpChannel()
                            channel = msg.channel
                        }
                    }

                    else channel = msg.channel

                    channel.send(levelUpMsg).catch(() => {
                        resetLevelUpChannel()
                        msg.channel.send(levelUpMsg)
                    })

                    if (newLvl === 100) channel.send(__("lvl_100_congrats")).catch(() => {
                        resetLevelUpChannel()
                        msg.channel.send(__("lvl_100_congrats"))
                    })
                    
                    const removeDeletedRoles = require("./remove_deleted_roles")
                    removeDeletedRoles(bot.db, msg.guild)

                    const roleRequest = bot.db.prepare("SELECT * FROM xp_roles WHERE guild_id = ? ORDER BY level ASC")
                    rolesRows = roleRequest.all(msg.guild.id)

                    for (const row of rolesRows) {
                        if (row.level === newLvl) {
                            const role = msg.guild.roles.cache.array().find(currentRole => currentRole.id === row.role_id)
                            if (msg.member.roles.cache.array().includes(role)) channel.send(`${__("you_already_have_the_role")} ${role.name}, ${__("so_i_did_not_gave_it_to_you")}`).catch(() => {
                                msg.channel.send(`${__("you_already_have_the_role")} ${role.name}, ${__("so_i_did_not_gave_it_to_you")}`)
                            })
                            else {
                                try {
                                    await msg.member.roles.add(role)

                                    channel.send(`${__("i_gave_you_the_role")} ${role.name}.`).catch(() => {
                                        msg.channel.send(`${__("i_gave_you_the_role")} ${role.name}.`)
                                    })
                                }
                                catch {
                                    channel.send(`${__("i_should_have_given_you")} ${role.name}, ${__("could_not_add_you_role")}`).catch(() => {
                                        msg.channel.send(`${__("i_should_have_given_you")} ${role.name}, ${__("could_not_add_you_role")}`)
                                    })
                                }
                            }
                        }
                    }
                }
        
                const xpUpdateRequest = bot.db.prepare("INSERT INTO xp_profiles VALUES(?,?,?,?,?,?) ON CONFLICT(guild_id,user_id) DO UPDATE SET xp=excluded.xp, total_xp=excluded.total_xp, level=excluded.level")
                xpUpdateRequest.run(msg.guild.id, msg.author.id, newXp, newTotalXp, newLvl, xpRow.color)
            }
        }
    }
}

module.exports = handleXp;