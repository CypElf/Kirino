import { Kirino } from "./types"

export default function getOwnerAvatar(bot: Kirino) {
    const ownerId = process.env.OWNER_ID
    if (ownerId) {
        const owner = bot.users.cache.get(ownerId)
        if (owner) {
            return owner.displayAvatarURL()
        }
    }
}