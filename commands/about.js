module.exports = {
	name: 'about',
    description: 'Affiche des informations sur moi.',
    guildOnly: false,
	args: false,
	category: "others",
	
	async execute(bot, msg) {
		msg.channel.send(`Je suis ${bot.user.username}, un bot développé en node.js à l'aide de l'API discord.js.\nOriginairement hébergée sur Glitch, j'ai maintenant un VPS pour moi toute seule.\nJe suis originaire de l'animé *Ore no imōto ga konna ni kawaii wake ga nai*, ou *Oreimo* pour les intimes, duquel je suis le second personnage principal.\nMon créateur se nomme CypElf, et son serveur qui est aussi mon serveur d'origine se nomme Avdray. Il a pour thème l'informatique en général, bien qu'axé sur le langage de programmation Rust.\nVous êtes les bienvenues dessus !\nMerci de m'avoir ajoutée à votre serveur et de m'utiliser ! <:kirinoglad:698923046819594351>\nhttps://discord.gg/btJhreB`);
	}
};