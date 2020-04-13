const config = require('../config.json');

module.exports = {
	name: 'react',
    description: 'Me fait réagir à un message par un émoji.',
    guildOnly: false,
    args: true,
    category: "others",
    usage: '[ID du message] [émoji]',
    
    async execute(bot, msg, args) {
		if (msg.author.id !== config.ownerID && msg.author.id !== msg.guild.ownerID) {
            return msg.channel.send("Vous n'êtes pas autorisés à utiliser cette commande ! <:kirinopff:698922942268047391>")
                .then(msg => msg.delete(5000))
                .catch();
        }

        if (msg.channel.type === "text") {
            if (!msg.guild.me.hasPermission("ADD_REACTIONS")) return msg.channel.send("Je n'ai pas la permission de réagir aux messages ! <:kirinopout:698923065773522944>")
        }

        if (args.length < 2) {
            return msg.channel.send("Veuillez saisir uniquement l'ID du message sur lequel réagir ainsi que l'émoji à y mettre. <:kirinopout:698923065773522944>");
        }

        const ID = args[0];
        const emoji = args[1];

        msg.channel.fetchMessage(ID)
			.then(msg2 => {
                msg2.react(emoji)
                    .then(() => {
                        msg.delete();
                    })
                    .catch(() => {
                        let customEmoji = emoji.match(/<:(.*?):[0-9]*>/gm);
                        if (customEmoji) customEmoji = customEmoji.map(emoji => emoji.split(":")[2].split(">")[0])[0];
                        else customEmoji = "nop";
                        msg2.react(customEmoji)
                            .then(() => {
                                msg.delete();
                            })
                            .catch(() => {
                                return msg.channel.send("L'émoji saisi est incorrect ou je n'y ai pas accès ! <:kirinopout:698923065773522944>")
                            });
                    })
			})
			.catch(err => {
				return msg.channel.send("L'ID du message fourni est incorrect ! <:kirinopout:698923065773522944>");
			});
    }
};
