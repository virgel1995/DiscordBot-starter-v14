const emojiInfo = require("../shared/emoji");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "emojiinfo",
  description: "shows info about an emoji",
  category: "INFORMATION",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    usage: "<emoji>",
    minArgsCount: 1,
    aliases: ["emojiinf"],
  },

  async messageRun(message, args, data) {
    const emoji = args[0];
    const response = emojiInfo(emoji, data.lang);
    await message.safeReply(response);
  },
};
