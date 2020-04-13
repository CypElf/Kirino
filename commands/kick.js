const { prefix } = require('../config.json');
module.exports = {
	name: 'kick',
    description: 'Kick le membre mentionné ou dont le pseudo est écrit sans faute (dans ce cas, le pseudo doit faire uniquement un mot pour pouvoir différencier le pseudo de la raison du ban). La permission de kick est requise.',
    guildOnly: true,
    args: true,
    category: "admin",
    usage: '[utilisateur] {raison}',

    async execute (bot, msg, [userToBan, ...reason]) {
        const canKick = msg.member.hasPermission('KICK_MEMBERS');
        if (!canKick) {
            return msg.channel.send("Vous n'avez pas les permissions suffisantes pour kick un membre. <:kirinopff:698922942268047391>")
        }
    
        if (!msg.guild.me.hasPermission('KICK_MEMBERS')) {
            return msg.channel.send("On dirait que je n'ai pas les permissions nécessaire pour kick des membres. <:kirinopout:698923065773522944>");
        }
    
        let kickMember = msg.mentions.members.first();
        if (!kickMember) {
            kickMember = msg.guild.members.cache.array().find((currentUser) => {
                return currentUser.user.username.toLowerCase() === userToBan.toLowerCase();
            });
            if (kickMember === undefined) {
                return msg.channel.send("Veuillez mentionner ou écrire le nom exact d'un utilisateur du serveur. <:kirinopout:698923065773522944>");
            }
        }
    
        if (!kickMember.kickable) {
            return msg.channel.send("Je ne peux pas kick cet utilisateur, il a un rang égal ou supérieur au mien. <:kirinopout:698923065773522944>");
        }
    
        if (kickMember.id === msg.member.id) {
            return msg.channel.send("Tu ne peux pas te kick toi même ! <:kirinopff:698922942268047391>")
        }
    
        if (!(msg.member.highestRole.comparePositionTo(kickMember.highestRole) > 0)) {
            return msg.channel.send("Vous ne pouvez pas kick ce membre. <:kirinopff:698922942268047391>");
        }

        msg.guild.members.kick(banMember, { reason: reason.join(" ") + " (kick par " + msg.author.tag + ")" })
            .then(member => {
                msg.channel.send(`${member.user.username} a été kick du serveur ! <:boot:568041855523094549>`);
                msg.delete();
            });
    }
};