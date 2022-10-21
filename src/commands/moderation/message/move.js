const { ChannelType } = require("discord.js");
const move = require("../shared/move");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "move",
  description: "move specified member to voice channel",
  category: "MODERATION",
  userPermissions: ["DeafenMembers"],
  botPermissions: ["DeafenMembers"],
  command: {
    enabled: true,
    usage: "<ID|@member> <channel> [reason]",
    minArgsCount: 1,
  },

  async messageRun(message, args, data) {
     
      let l = data.lang.COMMANDS.MODERATION.MESSAGE.MOVE
    const target = await message.guild.resolveMember(args[0], true);
    if (!target) return message.safeReply(l.ERR + ` ${args[0]}`);

    const channels = message.guild.findMatchingChannels(args[1]);
    if (!channels.length) return message.safeReply(l.ERR2);
    const targetChannel = channels.pop();
    if (!targetChannel.type === ChannelType.GuildVoice && !targetChannel.type === ChannelType.GuildStageVoice) {
      return message.safeReply(l.ERR3);
    }

    const reason = args.slice(2).join(" ");
    const response = await move(message, target, reason, targetChannel, data.lang);
    await message.safeReply(response);
  },
};
