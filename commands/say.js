const config = require('../config.json');

module.exports = {
	name: 'say',
    description: 'Me fait dire le message passé en argument. Seul le possesseur d\'un serveur peut l\'utiliser.',
    guildOnly: true,
    args: true,
    category: "others",
    usage: '[message]',
    
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
