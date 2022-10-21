const { isHex } = require("@helpers/Utils");
const { buildGreeting } = require("@handlers/greeting");
const { ApplicationCommandOptionType, ChannelType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "farewell",
  description: "setup farewell message",
  category: "ADMIN",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    minArgsCount: 1,
    subcommands: [
      {
        trigger: "status <on|off>",
        description: "enable or disable farewell message",
      },
      {
        trigger: "channel <#channel>",
        description: "configure farewell message",
      },
      {
        trigger: "preview",
        description: "preview the configured farewell message",
      },
      {
        trigger: "desc <text>",
        description: "set embed description",
      },
      {
        trigger: "thumbnail <ON|OFF>",
        description: "enable/disable embed thumbnail",
      },
      {
        trigger: "color <hexcolor>",
        description: "set embed color",
      },
      {
        trigger: "footer <text>",
        description: "set embed footer content",
      },
      {
        trigger: "image <url>",
        description: "set embed image",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    ephemeral: false,
    options: [
      {
        name: "status",
        description: "enable or disable farewell message",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "status",
            description: "enabled or disabled",
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
        name: "preview",
        description: "preview the configured farewell message",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "channel",
        description: "set farewell channel",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "channel name",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
        ],
      },
      {
        name: "desc",
        description: "set embed description",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "content",
            description: "description content",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "thumbnail",
        description: "configure embed thumbnail",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "status",
            description: "thumbnail status",
            type: ApplicationCommandOptionType.String,
            required: true,
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
        name: "color",
        description: "set embed color",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "hex-code",
            description: "hex color code",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "footer",
        description: "set embed footer",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "content",
            description: "footer content",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "image",
        description: "set embed image",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "url",
            description: "image url",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args, data) {
    const type = args[0].toLowerCase();
    const settings = data.settings;
    let response;
   let l = data.lang.COMMANDS
    // preview
    if (type === "preview") {
      response = await sendPreview(settings, message.member, data.lang);
    }

    // status
    else if (type === "status") {
      const status = args[1]?.toUpperCase();
      if (!status || !["ON", "OFF"].includes(status))
        return message.safeReply(data.lang.INVALID_STATUS);
      response = await setStatus(settings, status, data.lang);
    }

    // channel
    else if (type === "channel") {
      const channel = message.mentions.channels.first();
      response = await setChannel(settings, channel, data.lang);
    }

    // desc
    else if (type === "desc") {
      if (args.length < 2) return message.safeReply(data.pang.INVALID_CONTENT);
      const desc = args.slice(1).join(" ");
      response = await setDescription(settings, desc, data.lang);
    }

    // thumbnail
    else if (type === "thumbnail") {
      const status = args[1]?.toUpperCase();
      if (!status || !["ON", "OFF"].includes(status))
        return message.safeReply(data.lang.INVALID_STATUS);
      response = await setThumbnail(settings, status, data.lang);
    }

    // color
    else if (type === "color") {
      const color = args[1];
      if (!color || !isHex(color)) return message.safeReply(data.lang.INVALID_COLOR);
      response = await setColor(settings, color, data.lang);
    }

    // footer
    else if (type === "footer") {
      if (args.length < 2) return message.safeReply(data.lang.INVALID_CONTENT);
      const content = args.slice(1).join(" ");
      response = await setFooter(settings, content, data.lang);
    }

    // image
    else if (type === "image") {
      const url = args[1];
      if (!url) return message.safeReply(data.lang.INVALID_URL);
      response = await setImage(settings, url, data.lang);
    }

    //
    else response = data.lang.INVALID_USAGE;
    return message.safeReply(response);
  },

  async interactionRun(interaction, data) {
			let l = data.lang.COMMANDS
    const sub = interaction.options.getSubcommand();
    const settings = data.settings;

    let response;
    switch (sub) {
      case "preview":
        response = await sendPreview(settings, interaction.member, data.lang);
        break;

      case "status":
        response = await setStatus(settings, interaction.options.getString("status"), data.lang);
        break;

      case "channel":
        response = await setChannel(settings, interaction.options.getChannel("channel"), data.lang);
        break;

      case "desc":
        response = await setDescription(settings, interaction.options.getString("content"), data.lang);
        break;

      case "thumbnail":
        response = await setThumbnail(settings, interaction.options.getString("status"), data.lang);
        break;

      case "color":
        response = await setColor(settings, interaction.options.getString("color"), data.lang);
        break;

      case "footer":
        response = await setFooter(settings, interaction.options.getString("content"), data.lang);
        break;

      case "image":
        response = await setImage(settings, interaction.options.getString("url"), data.lang);
        break;

      default:
        response = data.lang.INVALID_SUBCOMMAND;
    }

    return interaction.followUp(response);
  },
};

async function sendPreview(settings, member, lang) {
	let l = lang.COMMANDS.ADMIN.GREETINGS.FARWELL
  if (!settings.farewell?.enabled) return l.NOT_ENABLED;

  const targetChannel = member.guild.channels.cache.get(settings.farewell.channel);
  if (!targetChannel) return l.NO_CONFIG;

  const response = await buildGreeting(member, "FAREWELL", settings.farewell);
  await targetChannel.safeSend(response);

  return ` ${l.PREV_CHANNEL} ${targetChannel.toString()}`;
}

async function setStatus(settings, status, lang) {
	const l = lang.COMMANDS.ADMIN.GREETINGS.FARWELL
  const enabled = status.toUpperCase() === "ON" ? true : false;
  settings.farewell.enabled = enabled;
  await settings.save();
  return `${l.STATS_DONE} ${status ? lang.ENABLED : lang.DISABLED}`;
}

async function setChannel(settings, channel, lang) {
	let l = lang.COMMANDS.ADMIN.GREETINGS.FARWELL
  if (!channel.canSendEmbeds()) {
    return ( l.NO_PERMS +
      channel.toString()
    );
  }
  settings.farewell.channel = channel.id;
  await settings.save();
  return `${l.SETTINGS_DONE} ${channel ? channel.toString() : lang.NOT_FOUND}`;
}

async function setDescription(settings, desc, lang) {
	let l = lang.COMMANDS.ADMIN.GREETINGS.FARWELL
  settings.farewell.embed.description = desc;
  await settings.save();
  return l.SETTINGS_DONE;
}

async function setThumbnail(settings, status, lang) {
		let l = lang.COMMANDS.ADMIN.GREETINGS.FARWELL
  settings.farewell.embed.thumbnail = status.toUpperCase() === "ON" ? true : false;
  await settings.save();
  return l.SETTINGS_DONE;
}

async function setColor(settings, color, lang) {
		let l = lang.COMMANDS.ADMIN.GREETINGS.FARWELL
  settings.farewell.embed.color = color;
  await settings.save();
  return l.SETTINGS_DONE;
}

async function setFooter(settings, content, lang) {
		let l = lang.COMMANDS.ADMIN.GREETINGS.FARWELL
  settings.farewell.embed.footer = content;
  await settings.save();
  return l.SETTINGS_DONE;
}

async function setImage(settings, url, lang) {
	let l = lang.COMMANDS.ADMIN.GREETINGS.FARWELL
  settings.farewell.embed.image = url;
  await settings.save();
  return l.SETTINGS_DONE;
}
