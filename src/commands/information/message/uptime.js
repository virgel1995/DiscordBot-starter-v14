const { timeformat } = require("@helpers/Utils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "uptime",
  description: "gives you bot uptime",
  category: "INFORMATION",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
  },

  async messageRun(message, args, data) {
         let l = data.lang.COMMANDS.INFORMATION.MESSAGE.UPTIME
    await message.safeReply(l.RES + `: \`${timeformat(process.uptime())}\``);
  },
};
