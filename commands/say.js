const config = require('../config.json');

module.exports = {
	name: 'say',
    description: 'Me fait dire le message passé en argument. Seul le possesseur d\'un serveur peut l\'utiliser.',
    guildOnly: true,
    args: true,
    category: "others",
    usage: '[message]',

    async help(bot, msg, helpEmbed) {
        helpEmbed
            .setDescription("Cette commande permet de me faire dire quelque chose.")
            .addField("Procédure", "Cette commande s'utilise comme ceci : `" + config.prefix + this.name + " " + this.usage + "`\nSeul le possesseur d'un serveur peut utiliser cette commande.");
        msg.channel.send(helpEmbed);
    },
    
    async execute(bot, msg, args) {
		if(msg.author.id !== config.ownerID && msg.author.id !== msg.guild.ownerID) {
            return;
        }
        	let text = args.join(" ");
        	msg.channel.send(text)
        		.then(() => {
                    if (msg.channel.type == 'text') {
        			    msg.delete(4)
                            .catch()
                    }
        		})
        		.catch()
    }
};
