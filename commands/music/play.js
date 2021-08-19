const { createAudioResource } = require("@discordjs/voice")
const { MessageEmbed } = require("discord.js")
const ytdl = require("ytdl-core-discord")
const yts = require("yt-search")
const musicAuth = require("../../lib/music/music_control_auth")

module.exports = {
    name: "play",
    guildOnly: true,
    args: true,

    async execute(bot, msg, args) {
        if (msg.member.voice.channel) {
            if (!msg.guild.me.voice.channel) {
                // eslint-disable-next-line node/global-require
                await require("./join").execute(bot, msg)
            }

            if (!musicAuth(msg.member, msg.guild.me)) {
                return msg.channel.send(`${__("not_allowed_to_control_music_because_not_in_my_voice_channel")} ${__("kirino_pout")}`)
            }

            const url = args[0]

            let song

            try {
                song = await getSongFromURL(url)
            }
            catch {
                try {

                    const search = args.join(" ")
                    const result = await yts(search)
                    const videos = result.videos.slice(0, 10)
                    let video = videos[0]

                    if (video.title.toLowerCase() !== search.toLowerCase()) {
                        const choicesMsg = await msg.channel.send(`${__("youtube_results")} ${__("kirino_glad")}\n${videos.map((v, i) => (i + 1) + " - " + v.title).join("\n")}\nN - ${__("nothing")}`)

                        const filter = cMsg => cMsg.author.id === msg.author.id && cMsg.content.toUpperCase() === "N" || (!isNaN(cMsg.content) && cMsg.content > 0 && cMsg.content <= videos.length)

                        let cMsg = await msg.channel.awaitMessages({ filter, max: 1, time: 30_000 })
                        cMsg = [...cMsg.values()]
                        if (cMsg.length === 1) {
                            if (cMsg[0].content.toUpperCase() !== "N") video = videos[cMsg[0].content - 1]
                            else return msg.channel.send(`${__("play_cancelled")} ${__("kirino_pout")}`)

                            cMsg[0].delete().catch()
                        }

                        choicesMsg.delete().catch()
                    }

                    song = await getSongFromURL(video.url)
                }
                catch {
                    return msg.channel.send(`${__("search_error")} ${__("kirino_what")}`)
                }
            }

            const serverQueue = bot.voicesQueues.get(msg.guild.id)
            serverQueue.songs.push(song)

            if (serverQueue.songs.length === 1) play(msg.channel, serverQueue)
            else msg.channel.send(`${__("added")}${song.title} ${__("to_the_queue")} ${__("kirino_glad")}`)
        }
        else {
            msg.channel.send(`${__("you_are_not_in_any_voice_channel")} ${__("kirino_pff")}`)
        }
    }
}

async function play(channel, queue) {
    if (queue.songs.length >= 1) {
        const nextSong = queue.songs[0]

        queue.player.play(nextSong.stream)

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
}

async function getSongFromURL(url) {
    const videoInfo = await ytdl.getBasicInfo(url)
    const stream = await ytdl(url, { highWaterMark: 1 << 25 }) // highWatermark of 32 MB, required for the moment to prevent the weird aborted error

    const { author, title, description, thumbnails } = videoInfo.videoDetails

    return {
        stream: createAudioResource(stream),
        url,
        title,
        description,
        thumbnail: thumbnails[thumbnails.length - 1].url,
        author_name: author.name,
        channel_url: author.channel_url
    }
}