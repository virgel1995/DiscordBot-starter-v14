const botinvite = require("../shared/botinvite");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "botinvite",
  description: "gives you bot invite",
  category: "INFORMATION",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    aliases: ["botinv", "invite"],
  },

  async messageRun(message, args, data) {
let l = data.lang.COMMANDS.INFORMATION.MESSAGE.BOTINVITE
    const response = botinvite(message.client, data.lang);
    try {
      await message.author.send(response);
      return message.safeReply(l.DM);
    } catch (ex) {
      return message.safeReply(l.ERR);
    }
  },
};
