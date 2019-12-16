const { prefix } = require('../config.json');
module.exports = {
	name: 'kick',
    description: 'Kick le membre mentionné ou dont le pseudo est écrit sans faute (dans ce cas, le pseudo doit faire uniquement un mot pour pouvoir différencier le pseudo de la raison du ban). La permission de kick est requise.',
    guildOnly: true,
    args: true,
    category: "admin",
    usage: '[utilisateur] {raison}',
    
    async help (bot, msg, helpEmbed) {
        helpEmbed
            .setDescription("Cette commande permet de kick un membre.")
            .addField("Procédure", "Cette commande s'utilise comme ceci : `" + prefix + this.name + " " + this.usage + "`");
            msg.channel.send(helpEmbed);
    },

    async execute (bot, msg, [userToBan, ...reason]) {
        const canKick = msg.member.hasPermission('KICK_MEMBERS');
        if (!canKick) {
            return msg.channel.send("Vous n'avez pas les permissions suffisantes pour kick un membre. <:warning:568037672770338816>")
        }
    
        if (!msg.guild.me.hasPermission('KICK_MEMBERS')) {
            return msg.channel.send("On dirait que je n'ai pas les permissions nécessaire pour kick des membres. <:warning:568037672770338816>");
        }
    
        let kickMember = msg.mentions.members.first();
        if (!kickMember) {
            kickMember = msg.guild.members.array().find((currentUser) => {
                return currentUser.user.username.toLowerCase() === userToBan.toLowerCase();
            });
            if (kickMember === undefined) {
                return msg.channel.send("Veuillez mentionner ou écrire le nom exact d'un utilisateur du serveur. <:warning:568037672770338816>");
            }
        }
    
        if (!kickMember) {
            return msg.channel.send("Veuillez mentionner un utilisateur valide du serveur. <:warning:568037672770338816>");
        }
    
        if (!kickMember.kickable) {
            return msg.channel.send("Je ne peux pas kick cet utilisateur, il a un rang égal ou supérieur au mien.");
        }
    
        if (kickMember.id === msg.member.id) {
            return msg.channel.send("Tu ne peux pas te kick toi même ! <:warning:568037672770338816>")
        }
    
        if (!(msg.member.highestRole.comparePositionTo(kickMember.highestRole) > 0)) {
            return msg.channel.send("Vous ne pouvez pas kick ce membre. <:warning:568037672770338816>");
        }
    
        kickMember.kick(reason.join(" ") + " (kick par " + msg.author.tag + ")").then(member => {
            msg.channel.send(`${member.user.username} a été kick du serveur ! <:boot:568041855523094549>`);
            msg.delete();
        });
    }
};