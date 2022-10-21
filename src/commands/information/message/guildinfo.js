const guildInfo = require("../shared/guild");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "guildinfo",
  description: "shows information about the server",
  category: "INFORMATION",
  botPermissions: ["EmbedLinks"],
  cooldown: 5,
  command: {
    enabled: true,
    aliases: ["serverinfo","server"],
  },

  async messageRun(message, args, data) {
    const response = await guildInfo(message.guild, data.lang);
    await message.safeReply(response);
  },
};
