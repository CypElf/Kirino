const config = require('../config.json');

module.exports = {
	name: 'say',
    description: 'Me fait dire le message passé en argument. Seul le possesseur d\'un serveur peut l\'utiliser.',
    guildOnly: true,
    args: true,
    category: "others",
    usage: '[message]',
    
    async execute(bot, msg, args) {
		if (msg.author.id !== config.ownerID && msg.author.id !== msg.guild.ownerID) {
            return msg.channel.send("Vous n'êtes pas autorisés à utiliser cette commande ! <:kirinopff:698922942268047391>")
                .then(msg => msg.delete({ timeout: 5000 }))
                .catch();
        }
        let text = args.join(" ");
        msg.channel.send(text)
            .then(() => {
                if (msg.channel.type == 'text') {
                    msg.delete()
                        .catch()
                }
            })
            .catch()
    }
};
