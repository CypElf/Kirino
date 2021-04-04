const ytdl = require("ytdl-core-discord")

module.exports = {
	name: "play",
    guildOnly: true,
    args: true,
    category: "others",

    async execute (bot, msg, args) {
        const url = args[0]

        if (bot.voicesQueues.has(msg.guild.id)) {            
            let readable
            let song
            
            try {
                readable = await ytdl(url)

                const videoInfo = await ytdl.getInfo(url)
                const { author, title, description, video_url, thumbnails } = videoInfo.videoDetails

                song = {
                    stream: readable,
                    url : video_url,
                    title: title,
                    description: description,
                    thumbnail: thumbnails[thumbnails.length - 1],
                    author_name: author.author_name,
                    channel_url: author.channel_url
                }
            }
            catch {
                try {
                    const yts = require("yt-search")

                    const search = args.join(" ")
                    const result = await yts(search)
                    const videos = result.videos.slice(0, 10)
                    let video

                    const choicesMsg = await msg.channel.send("Here are the results matching your search:\n" + videos.map((video, i) => (i + 1) + " - " + video.title).join("\n") + "\nN - cancel")
    
                    const filter = cMsg => cMsg.author.id === msg.author.id && cMsg.content.toUpperCase() === "N" || (!isNaN(cMsg.content) && cMsg.content > 0 && cMsg.content <= videos.length)
                    try {
                        let cMsg = await msg.channel.awaitMessages(filter, { max: 1, time: 30_000 })
                        cMsg = cMsg.array()
                        if (cMsg.length === 1) {
                            if (cMsg[0].content.toUpperCase() !== "N") video = videos[cMsg[0].content - 1]
                            else return msg.channel.send("Cancelled.")

                            cMsg[0].delete().catch(() => {})
                        }
                    }
                    catch {}

                    choicesMsg.delete().catch(() => {})

                    const { author, title, description, url, thumbnail } = video

                    readable = await ytdl(url)

                    song = {
                        stream: readable,
                        url : url,
                        title: title,
                        description: description,
                        thumbnail: thumbnail,
                        author_name: author.name,
                        channel_url: author.url
                    }
                }
                catch {
                    return msg.channel.send("Sorry, I didn't find anything.") // with yt-search, it seems to never happen, but just in case
                }
            }

            const serverQueue = bot.voicesQueues.get(msg.guild.id)
            serverQueue.songs.push(song)

            if (serverQueue.songs.length === 1) play(msg.channel, serverQueue)

            else msg.channel.send("Added " + song.title + " to the queue.")
        }
        else {
            msg.channel.send("I'm not in a voice channel.")
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
        channel.send("Currently playing : " + nextSong.title + " (" + nextSong.url + ")")
    }
    else {
        channel.send("Queue end reached.")
    }
}