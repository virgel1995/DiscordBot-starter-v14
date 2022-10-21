const { purgeMessages } = require("@helpers/ModUtils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "purgeattach",
  description: "deletes the specified amount of messages with attachments",
  category: "MODERATION",
  userPermissions: ["ManageMessages"],
  botPermissions: ["ManageMessages", "ReadMessageHistory"],
  command: {
    enabled: true,
    usage: "[amount]",
    aliases: ["purgeattachment", "purgeattachments"],
  },

  async messageRun(message, args, data) {
       let l = data.lang.COMMANDS.MODERATION.MESSAGE.PURGE
    const amount = args[0] || 99;

    if (amount) {
      if (isNaN(amount)) return message.safeReply(l.ERR);
      if (parseInt(amount) > 99) return message.safeReply(l.ERR2);
    }

    const response = await purgeMessages(message.member, message.channel, "ATTACHMENT", amount);

    if (typeof response === "number") {
      return message.channel.safeSend(l.DONE` ${response}`, 5);
    } else if (response === "BOT_PERM") {
      return message.safeReply(l.ERR3);
    } else if (response === "MEMBER_PERM") {
      return message.safeReply(l.ERR4);
    } else if (response === "NO_MESSAGES") {
      return message.safeReply(l.ERR5);
    } else {
      return message.safeReply(l.ERR6);
    }
  },
};
