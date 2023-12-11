export type Banword = {
    guild_id: string,
    word: string
}

export type Role = {
    guild_id: string,
    role_id: string,
    level: number
}

export type Afk = {
    user_id: string,
    reason: string | undefined
}

export type Call = {
    guild_id: string,
    channel_id: string | undefined,
    dm: boolean
    asfile: boolean
}

export type JoinLeave = {
    guild_id: string,
    joins_channel_id: string | undefined,
    leaves_channel_id: string | undefined
    join_message: string | undefined
    leave_message: string | undefined
}

export type Rule = {
    guild_id: string,
    rule: string
}

export type XpBlacklistedChannel = {
    guild_id: string,
    channel_id: string
}

export type XpBlacklistedRole = {
    guild_id: string,
    role_id: string
}

export type XpGuild = {
    guild_id: string,
    is_enabled: boolean,
    level_up_message: string | undefined,
    level_up_channel_id: string | undefined,
    scale: number
}

export type XpProfile = {
    guild_id: string,
    user_id: string,
    xp: number,
    total_xp: number,
    level: number,
    color: string | undefined,
    background: string | undefined
}

export type XpRole = {
    guild_id: string,
    role_id: string,
    level: number
}