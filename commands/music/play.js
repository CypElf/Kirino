const ytdl = require("ytdl-core-discord")

module.exports = {
	name: "play",
    guildOnly: true,
    args: true,

    async execute (bot, msg, args) {
        const musicAuth = require("../../lib/music/music_control_auth")

        if (musicAuth(msg.channel, msg.member, msg.guild.me)) {
            const url = args[0]

            let song
            
            try {
                song = await getSongFromURL(url)
            }
            catch {
                try {
                    const yts = require("yt-search")

                    const search = args.join(" ")
                    const result = await yts(search)
                    const videos = result.videos.slice(0, 10)
                    let video = videos[0]

                    if (video.title.toLowerCase() !== search.toLowerCase()) {
                        const choicesMsg = await msg.channel.send(`${__("youtube_results")} ${__("kirino_glad")}\n${videos.map((video, i) => (i + 1) + " - " + video.title).join("\n")}\nN - ${__("nothing")}`)
    
                        const filter = cMsg => cMsg.author.id === msg.author.id && cMsg.content.toUpperCase() === "N" || (!isNaN(cMsg.content) && cMsg.content > 0 && cMsg.content <= videos.length)
                        try {
                            let cMsg = await msg.channel.awaitMessages({ filter, max: 1, time: 30_000 })
                            cMsg = [...cMsg.values()]
                            if (cMsg.length === 1) {
                                if (cMsg[0].content.toUpperCase() !== "N") video = videos[cMsg[0].content - 1]
                                else return msg.channel.send(`${__("play_cancelled")} ${__("kirino_pout")}`)

                                cMsg[0].delete().catch(() => {})
                            }
                        }
                        catch {}

                        choicesMsg.delete().catch(() => {})
                    }

                    song = await getSongFromURL(video.url)
                }
                catch {
                    return msg.channel.send(`${__("nothing_matching_found")} ${__("kirino_what")}`) // with yt-search it seems to never happen, but just in case
                }
            }

            const serverQueue = bot.voicesQueues.get(msg.guild.id)
            serverQueue.songs.push(song)

            if (serverQueue.songs.length === 1) play(msg.channel, serverQueue)

            else msg.channel.send(`${__("added")}${song.title} ${__("to_the_queue")} ${__("kirino_glad")}`)
        }
    }
}

async function play(channel, queue) {
    if (queue.songs.length >= 1) {
        const nextSong = queue.songs[0]
        const dispatcher = queue.connection.play(nextSong.stream, { type: "opus" }).on("finish", () => {
            queue.songs.shift()
            play(channel, queue)
        })
        dispatcher.setVolume(queue.volume)

        const { MessageEmbed } = require("discord.js")
        const youtubeRed = "#DF1F18"

        const embed = new MessageEmbed()
            .setTitle(`${__("now_playing")} ${nextSong.title}`)
            .setURL(nextSong.url)
            .setColor(youtubeRed)
            .setImage(nextSong.thumbnail)
            .setAuthor(nextSong.author_name)

        if (nextSong.description) {
            embed.setDescription(nextSong.description.length > 150 ? nextSong.description.slice(0, 150) + "..." : nextSong.description)
        }

        channel.send({ embeds: [embed] })
    }
    else {
        channel.send(`${__("queue_end_reached")} ${__("kirino_glad")}`)
    }
}

async function getSongFromURL(url) {
    const readable = await ytdl(url)
    const videoInfo = await ytdl.getInfo(url)

    const { author, title, description, video_url, thumbnails } = videoInfo.videoDetails                    

    return {
        stream: readable,
        url : video_url,
        title: title,
        description: description,
        thumbnail: thumbnails[thumbnails.length - 1].url,
        author_name: author.name,
        channel_url: author.channel_url
    }
}