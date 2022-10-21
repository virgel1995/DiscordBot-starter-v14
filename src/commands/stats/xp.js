const { ApplicationCommandOptionType, ChannelType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "levelup",
  description: "configure the levelling system",
  category: "STATS",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    minArgsCount: 1,
    subcommands: [
      {
        trigger: "message <new-message>",
        description: "set custom level up message",
      },
      {
        trigger: "channel <#channel|off>",
        description: "set the channel to send level up messages to",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "message",
        description: "set custom level up message",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "message",
            description: "message to display when a user levels up",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "channel",
        description: "set the channel to send level up messages to",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "channel to send level up messages to",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args, data) {
    const sub = args[0];
    const subcommandArgs = args.slice(1);
    let response;

    // message
    if (sub === "message") {
      const message = subcommandArgs.join(" ");
      response = await setMessage(message, data.settings, data.lang);
    }

    // channel
    else if (sub === "channel") {
      const input = subcommandArgs[0];
      let channel;

      if (input === "off") channel = "off";
      else {
        const match = message.guild.findMatchingChannels(input);
        if (match.length === 0) return message.safeReply(data.lang.COMMANDS.STATS.XP.ERR);
        channel = match[0];
      }
      response = await setChannel(channel, data.settings, data.lang);
    }

    // invalid
    else response = data.lang.INVALID_SUB;
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();
    let response;

    if (sub === "message") response = await setMessage(interaction.options.getString("message"), data.settings);
    else if (sub === "channel") response = await setChannel(interaction.options.getChannel("channel"), data.settings, data.lang);
    else response = data.lang.INVALID_SUB;

    await interaction.followUp(response);
  },
};

async function setMessage(message, settings, lang) {
 
    const l = lang.COMMANDS.STATS.XP
  if (!message) return l.ERR1;
  settings.stats.xp.message = message;
  await settings.save();
  return l.MESSAGE_DONE;
}

async function setChannel(channel, settings,lang) {
 
    const l = lang.COMMANDS.STATS.XP
  if (!channel) return l.ERR;

  if (channel === "off") settings.stats.xp.channel = null;
  else settings.stats.xp.channel = channel.id;

  await settings.save();
  return l.CH_DONE;
}
