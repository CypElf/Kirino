BEGIN TRANSACTION;
DROP TABLE IF EXISTS "presences";
CREATE TABLE IF NOT EXISTS "presences" (
	"guild_id"	TEXT,
	"channel_id"	TEXT,
	"locked"	INTEGER NOT NULL,
	"dm"	INTEGER NOT NULL,
	"current"	INTEGER NOT NULL,
	PRIMARY KEY("guild_id")
);
DROP TABLE IF EXISTS "joins_leaves";
CREATE TABLE IF NOT EXISTS "joins_leaves" (
	"guild_id"	TEXT,
	"joins_channel_id"	TEXT,
	"leaves_channel_id"	TEXT,
	"join_message"	TEXT,
	"leave_message"	TEXT,
	PRIMARY KEY("guild_id")
);
DROP TABLE IF EXISTS "xp_blacklisted_roles";
CREATE TABLE IF NOT EXISTS "xp_blacklisted_roles" (
	"guild_id"	TEXT,
	"role_id"	TEXT UNIQUE
);
DROP TABLE IF EXISTS "xp_profiles";
CREATE TABLE IF NOT EXISTS "xp_profiles" (
	"guild_id"	TEXT NOT NULL,
	"user_id"	TEXT NOT NULL,
	"xp"	INTEGER NOT NULL,
	"total_xp"	INTEGER NOT NULL,
	"level"	INTEGER NOT NULL,
	"color"	TEXT,
	"background"	TEXT,
	UNIQUE("guild_id","user_id")
);
DROP TABLE IF EXISTS "xp_guilds";
CREATE TABLE IF NOT EXISTS "xp_guilds" (
	"guild_id"	TEXT,
	"is_enabled"	INTEGER NOT NULL,
	"level_up_message"	TEXT,
	"level_up_channel_id"	TEXT,
	"scale"	INTEGER,
	PRIMARY KEY("guild_id")
);
DROP TABLE IF EXISTS "xp_blacklisted_channels";
CREATE TABLE IF NOT EXISTS "xp_blacklisted_channels" (
	"guild_id"	TEXT,
	"channel_id"	TEXT UNIQUE
);
DROP TABLE IF EXISTS "xp_roles";
CREATE TABLE IF NOT EXISTS "xp_roles" (
	"guild_id"	TEXT NOT NULL,
	"role_id"	TEXT NOT NULL,
	"level"	INTEGER,
	UNIQUE("guild_id","role_id")
);
DROP TABLE IF EXISTS "rules";
CREATE TABLE IF NOT EXISTS "rules" (
	"guild_id"	TEXT NOT NULL,
	"rule"	TEXT
);
DROP TABLE IF EXISTS "banwords";
CREATE TABLE IF NOT EXISTS "banwords" (
	"guild_id"	TEXT NOT NULL,
	"word"	TEXT NOT NULL
);
DROP TABLE IF EXISTS "afk";
CREATE TABLE IF NOT EXISTS "afk" (
	"user_id"	TEXT NOT NULL,
	"reason"	TEXT
);
DROP TABLE IF EXISTS "prefixs";
CREATE TABLE IF NOT EXISTS "prefixs" (
	"id"	TEXT,
	"prefix"	TEXT,
	PRIMARY KEY("id")
);
DROP TABLE IF EXISTS "languages";
CREATE TABLE IF NOT EXISTS "languages" (
	"id"	TEXT,
	"language"	TEXT,
	PRIMARY KEY("id")
);
COMMIT;
