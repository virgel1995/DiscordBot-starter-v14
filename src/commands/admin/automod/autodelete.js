const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "autodelete",
  description: "manage the autodelete settings for the server",
  category: "AUTOMOD",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    minArgsCount: 2,
    subcommands: [
      {
        trigger: "attachments <on|off>",
        description: "allow or disallow attachments in message",
      },
      {
        trigger: "invites <on|off>",
        description: "allow or disallow invites in message",
      },
      {
        trigger: "links <on|off>",
        description: "allow or disallow links in message",
      },
      {
        trigger: "maxlines <number>",
        description: "sets maximum lines allowed per message [0 to disable]",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    ephemeral: false,
    options: [
      {
        name: "attachments",
        description: "allow or disallow attachments in message",
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
        name: "invites",
        description: "allow or disallow discord invites in message",
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
        name: "links",
        description: "allow or disallow links in message",
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
        name: "maxlines",
        description: "sets maximum lines allowed per message",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "amount",
            description: "configuration amount (0 to disable)",
            required: true,
            type: ApplicationCommandOptionType.Integer,
          },
        ],
      },
    ],
  },

  async messageRun(message, args, data) {
    const settings = data.settings;
    const sub = args[0].toLowerCase();
    let response;

    if (sub == "attachments") {
      const status = args[1].toLowerCase();
      if (!["on", "off"].includes(status)) return message.safeReply(lang.INVALID_STATUS);
      response = await antiAttachments(settings, status, data.lang);
    }

    //
    else if (sub === "invites") {
      const status = args[1].toLowerCase();
      if (!["on", "off"].includes(status)) return message.safeReply(data.lang.INVALID_STATUS);
      response = await antiInvites(settings, status, data.lang);
    }

    //
    else if (sub == "links") {
      const status = args[1].toLowerCase();
      if (!["on", "off"].includes(status)) return message.safeReply(data.lang.INVALID_STATUS);
      response = await antilinks(settings, status, data.lang);
    }

    //
    else if (sub === "maxlines") {
      const max = args[1];
      if (isNaN(max) || Number.parseInt(max) < 1) {
        return message.safeReply(data.lang.MAX_LINES_ERR);
      }
      response = await maxLines(settings, max, data.lang);
    }

    //
    else response = data.lang.INVALID_USAGE
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();
    const settings = data.settings;
    let response;

    if (sub == "attachments") {
      response = await antiAttachments(settings, interaction.options.getString("status"), data.lang);
    } else if (sub === "invites") response = await antiInvites(settings, interaction.options.getString("status"), data.lang);
    else if (sub == "links") response = await antilinks(settings, interaction.options.getString("status"), data.lang);
    else if (sub === "maxlines") response = await maxLines(settings, interaction.options.getInteger("amount"), data.lang);
    else response = data.lang.INVALID_USAGE

    await interaction.followUp(response);
  },
};

async function antiAttachments(settings, input,lang) {
  const status = input.toUpperCase() === "ON" ? true : false;
  settings.automod.anti_attachments = status;
  await settings.save();
  return lang.COMMANDS.ADMIN.AUTO_MOD.AUTO_DELETE.MESSAGE +
    status ? lang.COMMANDS.ADMIN.AUTO_MOD.AUTO_DELETE.ATTACH_DONE : lang.COMMANDS.ADMIN.AUTO_MOD.AUTO_DELETE.ATTACH_DONE2
}

async function antiInvites(settings, input, lang) {
  const status = input.toUpperCase() === "ON" ? true : false;
  settings.automod.anti_invites = status;
  await settings.save();
  return lang.COMMANDS.ADMIN.AUTO_MOD.AUTO_DELETE.MESSAGE +
    status ? lang.COMMANDS.ADMIN.AUTO_MOD.AUTO_DELETE.INVITES_DONE : lang.COMMANDS.ADMIN.AUTO_MOD.AUTO_DELETE.INVITES_DONE2
}

async function antilinks(settings, input,lang) {
  const status = input.toUpperCase() === "ON" ? true : false;
  settings.automod.anti_links = status;
  await settings.save();
  return lang.COMMANDS.ADMIN.AUTO_MOD.AUTO_DELETE.MESSAGE + status ? lang.COMMANDS.ADMIN.AUTO_MOD.AUTO_DELETE.LINKS_DONE : lang.COMMANDS.ADMIN.AUTO_MOD.AUTO_DELETE.LINKS_DONE2 ;
}

async function maxLines(settings, input, lang) {
  const lines = Number.parseInt(input);
  if (isNaN(lines)) return lang.NOT_NUMBER;

  settings.automod.max_lines = lines;
  await settings.save();
  return 
    input === 0
      ? lang.COMMANDS.ADMIN.AUTO_MOD.AUTO_DELETE.MAX_LINES_DONE
      : lang.COMMANDS.ADMIN.AUTO_MOD.AUTO_DELETE.MAX_LINES_DONE2.replace("{input}", input);
}
