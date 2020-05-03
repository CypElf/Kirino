module.exports = {
	name: "ping",
    description: "description_ping",
    guildOnly: false,
	args: false,
	category: "others",

	async execute (bot, msg) {
		let start = Date.now()
		await msg.channel.send("ping <:kirinowhat:698923096752783401>").then(async(m) => await m.edit(`pong <:kirinoglad:698923046819594351> (${Date.now() - start} ms)`))
	}
}