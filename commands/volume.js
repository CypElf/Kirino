module.exports = {
	name: "volume",
    guildOnly: true,
    args: true,
    category: "others",

    async execute (bot, msg, args) {
        const queue = bot.voicesQueues.get(msg.guild.id)

        if (!msg.guild.me.voice.channel) {
            msg.channel.send("I'm not in a voice channel!")
        }
        else if (msg.guild.me.voice.channel !== msg.member.voice.channel) {
            msg.channel.send("You're not in my voice channel, you're not allowed to change the volume!")
        }
        else {
            const newVolume = Number.parseFloat(args[0])
            if (!isNaN(newVolume) && newVolume > 0) {

                if (newVolume > 2) {
                    let confirmationMsg = await msg.channel.send(`A sound greater than 2 is highly not recommanded as the volume won't change that much, but the sound will be saturated. Are you sure you want to change the sound for ${newVolume} ?`)

                    confirmationMsg.react('✅')
                    confirmationMsg.react('❌')
    
                    const filter = (reaction, user) => reaction.emoji.name === '✅' && user.id === msg.author.id || reaction.emoji.name === '❌' && user.id === msg.author.id
                    const collector = confirmationMsg.createReactionCollector(filter, { max: 1, time: 30_000 })
    
                    collector.on("collect", async reaction => {
                        if (reaction.emoji.name === '✅') {
                            changeVolume(queue, newVolume)
                            msg.channel.send("Okay, volume changed anyway.")
                        }
                        else msg.channel.send("Operation cancelled.")
                    })
                }
                else {
                    changeVolume(queue, newVolume)
                    msg.channel.send("Volume changed.")
                }
            }
            else {
                msg.channel.send("Please specify a valid volume.")
            }
        }
    }
}

function changeVolume(queue, newVolume) {
    queue.volume = newVolume
    queue.connection.dispatcher.setVolume(queue.volume)
}