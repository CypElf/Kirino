const { prefix } = require('../config.json');
module.exports = {
	name: 'ban',
    description: 'Ban le membre mentionné ou dont le pseudo est écrit sans faute (dans ce cas, le pseudo doit faire uniquement un mot pour pouvoir différencier le pseudo de la raison du ban). La permission de ban est requise.',
    guildOnly: true,
    args: true,
    category: "admin",
    usage: '[utilisateur] {raison}',

    async execute (bot, msg, [userToBan, ...reason]) {
        if (!msg.member.hasPermission('BAN_MEMBERS')) {
            return msg.channel.send("Vous n'avez pas les permissions suffisantes pour bannir un membre. <:kirinopff:698922942268047391>")
        }
    
        if (!msg.guild.me.hasPermission('BAN_MEMBERS')) {
            return msg.channel.send("Je n'ai pas les permissions nécessaires pour bannir des membres. <:kirinopout:698923065773522944>");
        }
    
        let banMember = msg.mentions.members.first();
        if (!banMember) {
            banMember = msg.guild.members.array().find((currentUser) => {
                return currentUser.user.username.toLowerCase() === userToBan.toLowerCase();
            });
            if (banMember === undefined) {
                return msg.channel.send("Veuillez mentionner ou écrire le nom exact d'un utilisateur du serveur. <:kirinopout:698923065773522944>");
            }
        }
    
        if (!banMember.bannable) {
            return msg.channel.send("Je ne peux pas bannir cet utilisateur, il a un rang égal ou supérieur au mien. <:kirinopout:698923065773522944>");
        }
    
        if (banMember.id === msg.member.id) {
            return msg.channel.send("Tu ne peux pas te bannir toi même ! <:kirinopff:698922942268047391>")
        }
    
        if (!(msg.member.highestRole.comparePositionTo(banMember.highestRole) > 0)) {
            return msg.channel.send("Vous ne pouvez pas bannir ce membre. <:kirinopff:698922942268047391>");
        }
    
        msg.guild.members.ban(banMember, { reason: reason.join(" ") + " (banni par " + msg.author.tag + ")" })
            .then(member => {
                msg.channel.send(`${member.user.username} a été banni du serveur ! <:hammer:568068459485855752>`);
                msg.delete();
            });
    }
};