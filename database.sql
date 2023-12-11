BEGIN TRANSACTION;
DROP TABLE IF EXISTS "calls";
CREATE TABLE IF NOT EXISTS "calls" (
	"guild_id"	TEXT,
	"channel_id"	TEXT,
	"dm"	INTEGER NOT NULL,
	"asfile"	INTEGER NOT NULL,
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
DROP TABLE IF EXISTS "rules";
CREATE TABLE IF NOT EXISTS "rules" (
	"guild_id"	TEXT NOT NULL,
	"rule"	TEXT NOT NULL
);
DROP TABLE IF EXISTS "afk";
CREATE TABLE IF NOT EXISTS "afk" (
	"user_id"	TEXT,
	"reason"	TEXT,
	PRIMARY KEY("user_id")
);
DROP TABLE IF EXISTS "banwords";
CREATE TABLE IF NOT EXISTS "banwords" (
	"guild_id"	TEXT,
	"word"	TEXT,
	PRIMARY KEY("word","guild_id")
);
DROP TABLE IF EXISTS "xp_blacklisted_channels";
CREATE TABLE IF NOT EXISTS "xp_blacklisted_channels" (
	"guild_id"	TEXT,
	"channel_id"	TEXT,
	PRIMARY KEY("channel_id","guild_id")
);
DROP TABLE IF EXISTS "xp_blacklisted_roles";
CREATE TABLE IF NOT EXISTS "xp_blacklisted_roles" (
	"guild_id"	TEXT,
	"role_id"	TEXT,
	PRIMARY KEY("guild_id","role_id")
);
DROP TABLE IF EXISTS "xp_guilds";
CREATE TABLE IF NOT EXISTS "xp_guilds" (
	"guild_id"	TEXT,
	"is_enabled"	INTEGER,
	"level_up_message"	TEXT,
	"level_up_channel_id"	TEXT,
	"scale"	INTEGER,
	PRIMARY KEY("guild_id")
);
DROP TABLE IF EXISTS "xp_profiles";
CREATE TABLE IF NOT EXISTS "xp_profiles" (
	"guild_id"	TEXT,
	"user_id"	TEXT,
	"xp"	INTEGER NOT NULL,
	"total_xp"	INTEGER NOT NULL,
	"level"	INTEGER NOT NULL,
	"color"	TEXT,
	"background"	TEXT,
	PRIMARY KEY("guild_id","user_id")
);
DROP TABLE IF EXISTS "xp_roles";
CREATE TABLE IF NOT EXISTS "xp_roles" (
	"guild_id"	TEXT,
	"role_id"	TEXT,
	"level"	INTEGER NOT NULL,
	PRIMARY KEY("guild_id","role_id")
);
COMMIT;
