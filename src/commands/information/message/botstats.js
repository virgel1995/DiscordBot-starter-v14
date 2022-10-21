const botstats = require("../shared/botstats");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "botstats",
  description: "shows bot information",
  category: "INFORMATION",
  botPermissions: ["EmbedLinks"],
  cooldown: 5,
  command: {
    enabled: true,
    aliases: ["bot", "botinfo"],
  },

  async messageRun(message, args, data) {
    const response = botstats(message.client, data.lang);
    await message.safeReply(response);
  },
};
