const { EmbedBuilder, ApplicationCommandOptionType, ChannelType } = require("discord.js");
const { EMBED_COLORS } = require("@root/config.js");
const { stripIndent } = require("common-tags");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "automod",
  description: "various automod configuration",
  category: "AUTOMOD",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    minArgsCount: 1,
    subcommands: [
      {
        trigger: "status",
        description: "check automod configuration for this guild",
      },
      {
        trigger: "strikes <number>",
        description: "maximum number of strikes a member can receive before taking an action",
      },
      {
        trigger: "action <TIMEOUT|KICK|BAN>",
        description: "set action to be performed after receiving maximum strikes",
      },
      {
        trigger: "debug <on|off>",
        description: "turns on automod for messages sent by admins and moderators",
      },
      {
        trigger: "whitelist",
        description: "list of channels that are whitelisted",
      },
      {
        trigger: "whitelistadd <channel>",
        description: "add a channel to the whitelist",
      },
      {
        trigger: "whitelistremove <channel>",
        description: "remove a channel from the whitelist",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    ephemeral: false,
    options: [
      {
        name: "status",
        description: "check automod configuration",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "strikes",
        description: "set maximum number of strikes before taking an action",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "amount",
            description: "number of strikes (default 5)",
            required: true,
            type: ApplicationCommandOptionType.Integer,
          },
        ],
      },
      {
        name: "action",
        description: "set action to be performed after receiving maximum strikes",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "action",
            description: "action to perform",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
              {
                name: "TIMEOUT",
                value: "TIMEOUT",
              },
              {
                name: "KICK",
                value: "KICK",
              },
              {
                name: "BAN",
                value: "BAN",
              },
            ],
          },
        ],
      },
      {
        name: "debug",
        description: "enable/disable automod for messages sent by admins & moderators",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "status",
            description: "configuration status",
            required: true,
            type: ApplicationCommandOptionType.String,
            choices: [
              {
                name: "ON",
                value: "ON",
              },
              {
                name: "OFF",
                value: "OFF",
              },
            ],
          },
        ],
      },
      {
        name: "whitelist",
        description: "view whitelisted channels",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "whitelistadd",
        description: "add a channel to the whitelist",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "channel to add",
            required: true,
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
          },
        ],
      },
      {
        name: "whitelistremove",
        description: "remove a channel from the whitelist",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "channel to remove",
            required: true,
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
          },
        ],
      },
    ],
  },

  async messageRun(message, args, data) {
    const input = args[0].toLowerCase();
    const settings = data.settings;

    let response;
    if (input === "status") {
      response = await getStatus(settings, message.guild, data.lang);
    } else if (input === "strikes") {
      const strikes = args[1];
      if (isNaN(strikes) || Number.parseInt(strikes) < 1) {
        return message.safeReply(data.lang.MAX_LINES_ERR);
      }
      response = await setStrikes(settings, strikes, data.lang);
    } else if (input === "action") {
      const action = args[1].toUpperCase();
      if (!action || !["TIMEOUT", "KICK", "BAN"].includes(action))
        return message.safeReply(data.lang.COMMANDS.ADMIN.AUTO_MOD.AUTO_MOD.INVALID_ACTION);
      response = await setAction(settings, message.guild, action, data.lang);
    } else if (input === "debug") {
      const status = args[1].toLowerCase();
      if (!["on", "off"].includes(status)) return message.safeReply(data.lang.INVALID_STATUS);
      response = await setDebug(settings, status, data.lang);
    }

    // whitelist
    else if (input === "whitelist") {
      response = getWhitelist(message.guild, settings, data.lang);
    }

    // whitelist add
    else if (input === "whitelistadd") {
      const match = message.guild.findMatchingChannels(args[1]);
      if (!match.length) return message.safeReply(data.lang.NO_CHANNEL.replace("{channel}", args[1]));
      response = await whiteListAdd(settings, match[0].id, data.lang);
    }

    // whitelist remove
    else if (input === "whitelistremove") {
      const match = message.guild.findMatchingChannels(args[1]);
      if (!match.length) return message.safeReply(data.lang.NO_CHANNEL.replace("{channel}", args[1]));
      response = await whiteListRemove(settings, match[0].id, data.lang);
    }

    //
    else response = data.lang.INVALID_USAGE ;
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();
    const settings = data.settings;

    let response;

    if (sub === "status") response = await getStatus(settings, interaction.guild, data.lang);
    else if (sub === "strikes") response = await setStrikes(settings, interaction.options.getInteger("amount"), data.lang);
    else if (sub === "action")
      response = await setAction(settings, interaction.guild, interaction.options.getString("action"), data.lang);
    else if (sub === "debug") response = await setDebug(settings, interaction.options.getString("status"), data.lang);
    else if (sub === "whitelist") {
      response = getWhitelist(interaction.guild, settings, data.lang);
    } else if (sub === "whitelistadd") {
      const channelId = interaction.options.getChannel("channel").id;
      response = await whiteListAdd(settings, channelId, data.lang);
    } else if (sub === "whitelistremove") {
      const channelId = interaction.options.getChannel("channel").id;
      response = await whiteListRemove(settings, channelId, data.lang);
    }    
		else response = data.lang.INVALID_USAGE ;

    await interaction.followUp(response);
  },
};

async function getStatus(settings, guild, lang) {
  const { automod } = settings;

  const logChannel = settings.modlog_channel
    ? guild.channels.cache.get(settings.modlog_channel).toString()
    : lang.COMMANDS.ADMIN.AUTO_MOD.AUTO_MOD.NO_CONFIG ;

  // String Builder
  let desc = stripIndent`
    ❯ ${lang.COMMANDS.ADMIN.AUTO_MOD.AUTO_MOD.DESC1}: ${automod.max_lines || "NA"}
    ❯ ${lang.COMMANDS.ADMIN.AUTO_MOD.AUTO_MOD.DESC2}: ${automod.anti_massmention > 0 ? "✓" : "✕"}
    ❯ ${lang.COMMANDS.ADMIN.AUTO_MOD.AUTO_MOD.DESC3}: ${automod.anti_attachment ? "✓" : "✕"}
    ❯ ${lang.COMMANDS.ADMIN.AUTO_MOD.AUTO_MOD.DESC4}: ${automod.anti_links ? "✓" : "✕"}
    ❯ ${lang.COMMANDS.ADMIN.AUTO_MOD.AUTO_MOD.DESC5}: ${automod.anti_invites ? "✓" : "✕"}
    ❯ ${lang.COMMANDS.ADMIN.AUTO_MOD.AUTO_MOD.DESC6}: ${automod.anti_spam ? "✓" : "✕"}
    ❯ ${lang.COMMANDS.ADMIN.AUTO_MOD.AUTO_MOD.DESC7}: ${automod.anti_ghostping ? "✓" : "✕"}
  `;

  const embed = new EmbedBuilder()
    .setAuthor({ name: lang.COMMANDS.ADMIN.AUTO_MOD.AUTO_MOD.EMBED_AUTHOR , icon_url: guild.iconURL() })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(desc)
    .addFields(
      {
        name: lang.COMMANDS.ADMIN.AUTO_MOD.AUTO_MOD.EMBED_F1,
        value: logChannel,
        inline: true,
      },
      {
        name: lang.COMMANDS.ADMIN.AUTO_MOD.AUTO_MOD.EMBED_F3,
        value: automod.strikes.toString(),
        inline: true,
      },
      {
        name: lang.COMMANDS.ADMIN.AUTO_MOD.AUTO_MOD.EMBED_F3,
        value: automod.action,
        inline: true,
      },
      {
        name: lang.COMMANDS.ADMIN.AUTO_MOD.AUTO_MOD.EMBED_F4,
        value: automod.debug ? "✓" : "✕",
        inline: true,
      }
    );

  return { embeds: [embed] };
}

async function setStrikes(settings, strikes, lang) {
  settings.automod.strikes = strikes;
  await settings.save();
  return lang.COMMANDS.ADMIN.AUTO_MOD.AUTO_MOD.STRIKE_DONE.replace("{strike}", strikes);
}

async function setAction(settings, guild, action, lang) {
  if (action === "TIMEOUT") {
    if (!guild.members.me.permissions.has("ModerateMembers")) {
      return lang.NO_PERMISSIONS;
    }
  }

  if (action === "KICK") {
    if (!guild.members.me.permissions.has("KickMembers")) {
      return lang.NO_PERMISSIONS;
    }
  }

  if (action === "BAN") {
    if (!guild.members.me.permissions.has("BanMembers")) {
      return lang.NO_PERMISSIONS;
    }
  }

  settings.automod.action = action;
  await settings.save();
  return lang.COMMANDS.ADMIN.AUTO_MOD.AUTO_MOD.ACTION_DONE.replace("{action}", action);
}

async function setDebug(settings, input, lang) {
  const status = input.toLowerCase() === "on" ? true : false;
  settings.automod.debug = status;
  await settings.save();
  return lang.COMMANDS.ADMIN.AUTO_MOD.AUTO_MOD.DEBUG_DONE + `${status ? lang.ENABLED: lang.DISABLED}`;
}

function getWhitelist(guild, settings, lang) {
  const whitelist = settings.automod.wh_channels;
  if (!whitelist || !whitelist.length) return lang.COMMANDS.ADMIN.AUTO_MOD.AUTO_MOD.NO_WHITELISTED ;

  const channels = [];
  for (const channelId of whitelist) {
    const channel = guild.channels.cache.get(channelId);
    if (!channel) continue;
    if (channel) channels.push(channel.toString());
  }

  return lang.COMMANDS.ADMIN.AUTO_MOD.AUTO_MOD.WHITELISTED_CH + `${channels.join(", ")}`;
}

async function whiteListAdd(settings, channelId, lang) {
  if (settings.automod.wh_channels.includes(channelId)) return lang.COMMANDS.ADMIN.AUTO_MOD.AUTO_MOD.ALR_WHITELIATED;
  settings.automod.wh_channels.push(channelId);
  await settings.save();
  return lang.COMMANDS.ADMIN.AUTO_MOD.AUTO_MOD.WHITELISTED ;
}

async function whiteListRemove(settings, channelId, lang) {
  if (!settings.automod.wh_channels.includes(channelId)) return lang.COMMANDS.ADMIN.AUTO_MOD.AUTO_MOD.NOT_WHITELISTED ;
  settings.automod.wh_channels.splice(settings.automod.wh_channels.indexOf(channelId), 1);
  await settings.save();
  return lang.COMMANDS.ADMIN.AUTO_MOD.AUTO_MOD.REMOVED_WHITELISTED;
}
