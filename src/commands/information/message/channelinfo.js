const channelInfo = require("../shared/channel");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "channelinfo",
  description: "shows information about a channel",
  category: "INFORMATION",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    usage: "[#channel|id]",
    aliases: ["chinfo"],
  },

  async messageRun(message, args, data) {
         let l = data.lang.COMMANDS.INFORMATION.MESSAGE.CHANNELINFO
    let targetChannel;

    if (message.mentions.channels.size > 0) {
      targetChannel = message.mentions.channels.first();
    }

    // find channel by name/ID
    else if (args.length > 0) {
      const search = args.join(" ");
      const tcByName = message.guild.findMatchingChannels(search);
      if (tcByName.length === 0) return message.safeReply(l.NO_SEARCH + `\`${search}\`!`);
      if (tcByName.length > 1) return message.safeReply(l.MULTI + ` \`${search}\`!`);
      [targetChannel] = tcByName;
    } else {
      targetChannel = message.channel;
    }

    const response = channelInfo(targetChannel, data.lang);
    await message.safeReply(response);
  },
};
