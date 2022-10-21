const { ApplicationCommandOptionType, ChannelType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "modlog",
  description: "enable or disable moderation logs",
  category: "ADMIN",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    usage: "<#channel|off>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    ephemeral: false,
    options: [
      {
        name: "channel",
        description: "channels to send mod logs",
        required: false,
        type: ApplicationCommandOptionType.Channel,
        channelTypes: [ChannelType.GuildText],
      },
    ],
  },

  async messageRun(message, args, data) {
    const input = args[0].toLowerCase();
    let targetChannel;

    if (input === "none" || input === "off" || input === "disable") targetChannel = null;
    else {
      if (message.mentions.channels.size === 0) return message.safeReply(data.lang.INVALID_USAGE);
      targetChannel = message.mentions.channels.first();
    }

    const response = await setChannel(targetChannel, data.settings, data.lang);
    return message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const response = await setChannel(interaction.options.getChannel("channel"), data.settings, data.lang);
    return interaction.followUp(response);
  },
};

async function setChannel(targetChannel, settings,lang) {
  if (targetChannel && !targetChannel.canSendEmbeds()) {
    return lang.COMMANDS.ADMIN.MOD_LOG.ERR;
  }

  settings.modlog_channel = targetChannel?.id;
  await settings.save();
  return `Configuration saved! Modlog channel ${targetChannel ? lang.UPDATED : lang.REMOVED}`;
}
