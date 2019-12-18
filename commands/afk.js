module.exports = {
	name: 'afk',
    description: 'Permet de laisser un message à ceux qui voudraient vous mentionner pendant que vous êtes AFK. La raison est optionnelle.',
    guildOnly: true,
    args: false,
    category: "others",
    usage: "{raison de l'absence}",

    async execute (bot, msg, args) {
        let reason;
        if (args) {
            reason = args.join(' ');
        }
    
        let afklist = bot.afk.get(msg.author.id);
        let construct;
    
        if (!afklist) {
            if (reason) {
                construct = {
                    id: msg.author.id,
                    usertag: msg.author.username,
                    reason: reason
                };
            }
            else {
                construct = {
                    id: msg.author.id,
                    usertag: msg.author.username,
                };
            }
    
            bot.afk.set(msg.author.id, construct);
            if (reason) {
                return msg.reply(`tu as bien été mis AFK pour la raison suivante : ${reason}`);
            }
            else {
                return msg.reply(`tu as bien été mis AFK.`);
            }
        }
    }
};