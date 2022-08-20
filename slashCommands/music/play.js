const { SlashCommandBuilder } = require("@discordjs/builders")
const { createAudioResource, StreamType } = require("@discordjs/voice")
const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require("discord.js")
const util = require("util")
const i18next = require("i18next")
const t = i18next.t.bind(i18next)
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
            await interaction.deferReply()

            if (!interaction.guild.me.voice.channel) {
                i18next.loadNamespaces("join")
                // eslint-disable-next-line node/global-require
                const join = require("./join")
                await join.execute(bot, interaction, true)
            }

            // the voice state update a long time after the bot joined the voice channel for some reason...
            // without this, even after the bot joined the voice channel, interaction.guild.me.voice.channel is null anyway
            await util.promisify(setTimeout)(300)

            if (!musicAuth(interaction.member, interaction.guild.me)) {
                return interaction.editReply({ content: `${t("not_allowed_to_control_music_because_not_in_my_voice_channel")} ${t("common:kirino_pout")}`, ephemeral: true })
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
                    const videos = result.videos.slice(0, 10).map(video => {
                        if (video.description.length > 100) {
                            video.description = video.description.slice(0, 97) + "..."
                        }
                        return video
                    })
                    let video = videos[0]

                    if (video.title.toLowerCase() !== raw.toLowerCase()) {
                        const actionRow = new MessageActionRow()
                            .addComponents(
                                new MessageSelectMenu()
                                    .setCustomId("youtube_choice")
                                    .setPlaceholder(t("nothing_selected"))
                                    .addOptions(videos.map((v, i) => ({ label: v.title, description: v.description, value: i.toString() })).concat([{ label: t("cancel"), description: t("cancel_description"), value: "cancel" }]))
                            )

                        await interaction.editReply({ content: `${t("youtube_results")} ${t("common:kirino_glad")}`, components: [actionRow] })
                        const resultsMsg = await interaction.fetchReply()

                        const filter = i => {
                            i.deferUpdate()
                            return interaction.user.id === i.user.id
                        }

                        try {
                            const i = await resultsMsg.awaitMessageComponent({ filter, componentType: "SELECT_MENU", time: 30_000 })

                            if (i.values[0] === "cancel") throw new Error()

                            const index = parseInt(i.values[0])
                            video = videos[index]
                        }
                        catch {
                            i18next.setDefaultNamespace(this.data.name)
                            return interaction.editReply({ content: `${t("play_cancelled")} ${t("common:kirino_pout")}`, components: [] })
                        }
                    }

                    song = await getSongFromURL(video.url)
                }
                catch (err) {
                    console.error(err)
                    return interaction.editReply({ content: `${t("error")} ${t("common:kirino_what")}`, ephemeral: true })
                }
            }

            i18next.setDefaultNamespace(this.data.name)
            const serverQueue = bot.voicesQueues.get(interaction.guild.id)
            if (serverQueue === undefined) return interaction.editReply({ content: `${t("play_cancelled")} ${t("common:kirino_pout")}`, components: [] }) // bot has left voice channel while choice was made

            serverQueue.songs.push(song)

            const confirmation = `${t("added")}${song.title} ${t("to_the_queue")} ${t("common:kirino_glad")}`
            if (wasDirectLink) interaction.editReply(confirmation)
            else interaction.editReply({ content: confirmation, components: [] })

            if (serverQueue.songs.length === 1) {
                try {
                    this.play(interaction.channel, serverQueue)
                }
                catch {
                    return
                }
            }
        }
        else {
            interaction.reply({ content: `${t("you_are_not_in_any_voice_channel")} ${t("common:kirino_pff")}`, ephemeral: true })
        }
    },

    async play(channel, queue) {
        if (queue.songs.length >= 1) {
            const nextSong = queue.songs[0]

            // try {
            queue.player.play(nextSong.stream)
            // }
            // catch {
            //     return
            // }

            const youtubeRed = "#DF1F18"

            const embed = new MessageEmbed()
                .setTitle(`${t("play:now_playing")} ${nextSong.title}`)
                .setURL(nextSong.url)
                .setColor(youtubeRed)
                .setImage(nextSong.thumbnail)
                .setAuthor({ name: nextSong.author_name })

            if (nextSong.description) {
                embed.setDescription(nextSong.description.length > 150 ? nextSong.description.slice(0, 150) + "..." : nextSong.description)
            }

            channel.send({ embeds: [embed] })
        }
    }
}

async function getSongFromURL(url) {
    const videoInfo = await ytdl.getBasicInfo(url)
    const stream = await ytdl(url, { highWaterMark: 1 << 25 }) // highWatermark of 32 MB, required for the moment to prevent the weird aborted error

    const { author, title, description, thumbnails } = videoInfo.videoDetails

    return {
        stream: createAudioResource(stream, { inputType: StreamType.Opus }),
        url,
        title,
        description,
        thumbnail: thumbnails[thumbnails.length - 1].url,
        author_name: author.name,
        channel_url: author.channel_url
    }
}