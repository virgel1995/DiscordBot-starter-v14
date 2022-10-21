const { purgeMessages } = require("@helpers/ModUtils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "purgeuser",
  description: "deletes the specified amount of messages",
  category: "MODERATION",
  userPermissions: ["ManageMessages"],
  botPermissions: ["ManageMessages", "ReadMessageHistory"],
  command: {
    enabled: true,
    usage: "<@user|ID> [amount]",
    aliases: ["purgeusers"],
    minArgsCount: 1,
  },

  async messageRun(message, args, data) {
         let l = data.lang.COMMANDS.MODERATION.MESSAGE.PURGE
    const target = await message.guild.resolveMember(args[0]);
    if (!target) return message.safeReply(l.ERR7 + ` ${args[0]}`);
    const amount = (args.length > 1 && args[1]) || 99;

    if (amount) {
      if (isNaN(amount)) return message.safeReply(l.ERR);
      if (parseInt(amount) > 100) return message.safeReply(l.ERR2);
    }

    const response = await purgeMessages(message.member, message.channel, "USER", amount, target);

    if (typeof response === "number") {
      return message.channel.safeSend(l.DONE + ` ${response}`, 5);
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
