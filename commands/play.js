module.exports = {
	name: "play",
    guildOnly: true,
    args: true,
    category: "others",

    async execute (bot, msg, args) {
        const ytdl = require("ytdl-core-discord")
        const url = args[0]

        if (bot.voicesQueues.has(msg.guild.id)) {
            try {
                const readable = await ytdl(url)
                const videoInfo = await ytdl.getInfo(url)
                const { author: { name, channel_url }, title, description, video_url, thumbnails } = videoInfo.videoDetails

                const song = {
                    stream: readable,
                    url : video_url,
                    title: title,
                    description: description,
                    thumbnail: thumbnails[thumbnails.length - 1],
                    author_name: name,
                    channel_url: channel_url
                }

                const serverQueue = bot.voicesQueues.get(msg.guild.id)
                
                serverQueue.songs.push(song)
                
                if (serverQueue.songs.length === 1) play(msg.channel, serverQueue)

                else msg.channel.send("Added to the queue.")
            }
            catch {
                msg.channel.send("Video not found.")
            }
        }
        else {
            msg.channel.send("I'm not in a voice channel.")
        }
    }
}

function play(channel, queue) {
    console.log(queue.songs)
    if (queue.songs.length >= 1) {
        const nextSong = queue.songs[0]
        const dispatcher = queue.connection.play(nextSong.stream, { type: "opus" }).on("finish", () => {
            queue.songs.shift()
            play(channel, queue)
        })
        dispatcher.setVolume(queue.volume)
        channel.send("Currently playing : " + nextSong.title + " (" + nextSong.url + ")")
    }
}