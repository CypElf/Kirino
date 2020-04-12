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
            return msg.channel.send("Vous n'avez pas les permissions suffisantes pour bannir un membre. <:warning:568037672770338816>")
        }
    
        if (!msg.guild.me.hasPermission('BAN_MEMBERS')) {
            return msg.channel.send("On dirait que je n'ai pas les permissions nécessaire pour bannir des membres. <:warning:568037672770338816>");
        }
    
        let banMember = msg.mentions.members.first();
        if (!banMember) {
            banMember = msg.guild.members.array().find((currentUser) => {
                return currentUser.user.username.toLowerCase() === userToBan.toLowerCase();
            });
            if (banMember === undefined) {
                return msg.channel.send("Veuillez mentionner ou écrire le nom exact d'un utilisateur du serveur. <:warning:568037672770338816>");
            }
        }
    
        if (!banMember.bannable) {
            return msg.channel.send("Je ne peux pas bannir cet utilisateur, il a un rang égal ou supérieur au mien. <:warning:568037672770338816>");
        }
    
        if (banMember.id === msg.member.id) {
            return msg.channel.send("Tu ne peux pas te bannir toi même ! <:warning:568037672770338816>")
        }
    
        if (!(msg.member.highestRole.comparePositionTo(banMember.highestRole) > 0)) {
            return msg.channel.send("Vous ne pouvez pas bannir ce membre. <:warning:568037672770338816>");
        }
    
        banMember.ban(reason.join(" ") + " (banni par " + msg.author.tag + ")").then(member => {
            msg.channel.send(`${member.user.username} a été banni du serveur ! <:hammer:568068459485855752>`);
            msg.delete();
        });
    }
};