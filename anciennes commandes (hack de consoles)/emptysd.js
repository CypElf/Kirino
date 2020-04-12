const { prefix } = require('../config.json');
const Discord = require("discord.js");
module.exports = {
	name: 'emptysd',
    description: 'Donne les instructions à suivre si tous les fichiers de la carte SD d\'une 3ds hackée sont supprimés.',
    guildOnly: false,
    args: false,
    category: "hack",
    
    async execute(bot, msg) {
        const pack = new Discord.Attachment('https://cdn.glitch.com/95815403-f1a3-4b7b-8652-5976c8dec4c1%2Fpack.zip?v=1566742829009', 'pack.zip');
        msg.channel.send("Téléchargement du pack, veuillez patienter un moment...")
        .then(newmsg => {
            if (msg.channel.type == 'text') {
                msg.delete();
            }
            msg.channel.startTyping();
            msg.channel.send(`Si tu as supprimé tous les fichiers de ta carte SD, commence par mettre le contenu de l'archive jointe à la racine de ta carte SD. Puis, va dans l'application **mode téléchargement** de ta 3ds, fais la combinaison de touches \`L + bas + select\`, va dans \`miscellaneous options\`, puis fais \`switch the hb. title to the current app\`. Reviens au menu home, quitte l'application, relance la, et tu arriveras dans **l'homebrew launcher**. Tu n'as plus qu'à lancer l'homebrew **FBI** et à ré installer les \`.cia\` se trouvant dans le dossier \`cias\` de ta carte SD. Pour voir comment installer un \`.cia\`, vous pouvez faire la commande \`${prefix}install_cia\`.`, pack)
            .then(() => {
                msg.channel.stopTyping();
                newmsg.delete();
            });
        });  
	}
};