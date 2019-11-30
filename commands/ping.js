module.exports = {
	name: 'ping',
    description: 'Affiche "pong !". Utile pour tester si je marche correctement.',
    guildOnly: false,
	args: false,
	category: "others",

	async execute (bot, msg) {
		let start = Date.now();
		await msg.channel.send("ping").then(async(m) => await m.edit(`pong (${Date.now() - start} ms)`));
	}
};