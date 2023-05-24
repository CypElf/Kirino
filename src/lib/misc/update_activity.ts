import { Kirino } from "./types";

export default function updateActivity(bot: Kirino) {
    bot.user?.setPresence({ activities: [{ name: "kirino.xyz", type: "WATCHING" /* PLAYING, STREAMING, LISTENING or WATCHING */ }], status: "dnd" })
}