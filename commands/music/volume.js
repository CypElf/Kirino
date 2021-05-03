module.exports = {
	name: "volume",
    guildOnly: true,
    args: true,

    async execute (bot, msg, args) {
        const queue = bot.voicesQueues.get(msg.guild.id)

        const musicAuth = require("../../lib/music/music_control_auth")

        if (musicAuth(msg.channel, msg.member, msg.guild.me)) {
            const newVolume = Number.parseFloat(args[0])
            if (!isNaN(newVolume) && newVolume > 0 && newVolume < 10) {

                if (newVolume > 2) {
                    let confirmationMsg = await msg.channel.send(`${__("high_volume_not_recommanded")} ${newVolume} ?`)

                    confirmationMsg.react('✅')
                    confirmationMsg.react('❌')
    
                    const filter = (reaction, user) => reaction.emoji.name === '✅' && user.id === msg.author.id || reaction.emoji.name === '❌' && user.id === msg.author.id
                    const collector = confirmationMsg.createReactionCollector(filter, { max: 1, time: 30_000 })
    
                    collector.on("collect", async reaction => {
                        if (reaction.emoji.name === '✅') {
                            changeVolume(queue, newVolume)
                            msg.channel.send(`${__("volume_changed_anyway")} ${newVolume}. ${__("kirino_pout")}`)
                        }
                        else msg.channel.send(`${__("volume_change_cancelled")} ${__("kirino_glad")}`)
                    })
                }
                else {
                    changeVolume(queue, newVolume)
                    msg.channel.send(`${__("volume_changed")} ${newVolume}. ${__("kirino_glad")}`)
                }
            }
            else {
                msg.channel.send(`${__("bad_volume")} ${__("kirino_pff")}`)
            }
        }
    }
}

function changeVolume(queue, newVolume) {
    queue.volume = newVolume
    queue.connection.dispatcher.setVolume(queue.volume)
}