module.exports = {
  BOT_NAME : "NEW STEP",
  OWNER_IDS: ["799984138111287337"],// Bot owner ID's
  PREFIX: ".", // Default prefix for the bot
  SUPPORT_SERVER: "https://discord.gg/WsJp96BK22", 
CHECKGITHUBUPDATES: {
ENABLED : false,
REPO: "https://api.github.com/repos/virgel1995/DiscordBot-starter-v14"
},
  // check updates from github release 

  INTERACTIONS: {
    SLASH: true, // Should the interactions be enabled
    CONTEXT: true, // Should contexts be enabled
    GLOBAL: true, // Should the interactions be registered globally
    TEST_GUILD_ID: "xxxxxxxxxxx", // Guild ID where the interactions should be registered. [** Test you commands here first **]
  },
	IMAGE: {
    ENABLED: false,
    BASE_API: "https://image-api.strangebot.xyz",
  },
  EMBED_COLORS: {
    BOT_EMBED: "#068ADD",
    TRANSPARENT: "#36393F",
    SUCCESS: "#00A56A",
    ERROR: "#D61A3C",
    WARNING: "#F7E919",
  },
  CACHE_SIZE: {
    GUILDS: 100,
    USERS: 10000,
    MEMBERS: 10000,
  },
  MESSAGES: {
    API_ERROR: "Unexpected Backend Error! Try again later or contact support server",
  },
  PRESENCE: {
    ENABLED: true, // Whether or not the bot should update its status
    STATUS: ["online", "idle", "dnd"], // The bot's status [online, idle, dnd, invisible]
    TYPE: ["COMPETING", "WATCHING", "LISTENING", "STREAMING"], // Status type for the bot [PLAYING | LISTENING | WATCHING | COMPETING]
    MESSAGE: [
"{members} members",
"{servers} servers",
"Time to Go space",
"Ping For Prefix",
"Slach/text: Cmds"
    ], // Your bot status message
  },
};
