const { SlashCommandBuilder } = require("@discordjs/builders")
const { createAudioResource } = require("@discordjs/voice")
const { MessageEmbed } = require("discord.js")
const util = require("util")
const t = require("i18next").t.bind(require("i18next"))
const ytdl = require("ytdl-core-discord")
const yts = require("yt-search")
const musicAuth = require("../../lib/music/music_control_auth")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Play a song in a voice channel from any YouTube video")
        .addStringOption(option => option.setName("song").setDescription("A YouTube link or a title to search for on YouTube").setRequired(true)),
    guildOnly: true,

    async execute(bot, interaction) {
        if (interaction.member.voice.channel) {
            if (!interaction.guild.me.voice.channel) {
                // eslint-disable-next-line node/global-require
                const join = require("./join")
                await join.execute(bot, interaction, true)
            }

            // the voice state update a long time after the bot joined the voice channel for some reason...
            // without this, even after the bot joined the voice channel, interaction.guild.me.voice.channel is null anyway
            await util.promisify(setTimeout)(200)

            if (!musicAuth(interaction.member, interaction.guild.me)) {
                return interaction.reply({ content: `${t("not_allowed_to_control_music_because_not_in_my_voice_channel")} ${t("common:kirino_pout")}`, ephemeral: true })
            }

            const raw = interaction.options.getString("song")

            let song
            let wasDirectLink = false

            try {
                song = await getSongFromURL(raw)
                wasDirectLink = true
            }
            catch {
                try {

                    const result = await yts(raw)
                    const videos = result.videos.slice(0, 10)
                    let video = videos[0]

                    if (video.title.toLowerCase() !== raw.toLowerCase()) {
                        await interaction.reply(`${t("youtube_results")} ${t("common:kirino_glad")}\n${videos.map((v, i) => (i + 1) + " - " + v.title).join("\n")}\nN - ${t("nothing")}`)

                        const filter = cMsg => interaction.user.id === interaction.user.id && cMsg.content.toUpperCase() === "N" || (!isNaN(cMsg.content) && cMsg.content > 0 && cMsg.content <= videos.length)

                        let cMsg = await interaction.channel.awaitMessages({ filter, max: 1, time: 30_000 })
                        cMsg = [...cMsg.values()]
                        if (cMsg.length === 1) {
                            if (cMsg[0].content.toUpperCase() !== "N") video = videos[cMsg[0].content - 1]
                            else return interaction.followUp(`${t("play_cancelled")} ${t("common:kirino_pout")}`)

                            cMsg[0].delete().catch()
                        }
                    }

                    song = await getSongFromURL(video.url)
                }
                catch {
                    return interaction.reply({ content: `${t("search_error")} ${t("common:kirino_what")}`, ephemeral: true })
                }
            }

            const serverQueue = bot.voicesQueues.get(interaction.guild.id)
            serverQueue.songs.push(song)

            const confirmation = `${t("added")}${song.title} ${t("to_the_queue")} ${t("common:kirino_glad")}`
            if (wasDirectLink) interaction.reply(confirmation)
            else interaction.editReply(confirmation)

            if (serverQueue.songs.length === 1) play(interaction.channel, serverQueue)
        }
        else {
            interaction.reply({ content: `${t("you_are_not_in_any_voice_channel")} ${t("common:kirino_pff")}`, ephemeral: true })
        }
    }
}

async function play(channel, queue) {
    if (queue.songs.length >= 1) {
        const nextSong = queue.songs[0]

        queue.player.play(nextSong.stream)

        const youtubeRed = "#DF1F18"

        const embed = new MessageEmbed()
            .setTitle(`${t("now_playing")} ${nextSong.title}`)
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