const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "maxwarn",
  description: "set max warnings configuration",
  category: "ADMIN",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    minArgsCount: 1,
    subcommands: [
      {
        trigger: "limit <number>",
        description: "set max warnings a member can receive before taking an action",
      },
      {
        trigger: "action <timeout|kick|ban>",
        description: "set action to performed after receiving maximum warnings",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    ephemeral: false,
    options: [
      {
        name: "limit",
        description: "set max warnings a member can receive before taking an action",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "amount",
            description: "max number of strikes",
            type: ApplicationCommandOptionType.Integer,
            required: true,
          },
        ],
      },
      {
        name: "action",
        description: "set action to performed after receiving maximum warnings",
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
    ],
  },

  async messageRun(message, args, data) {
      
    let l = data.lang.COMMANDS.ADMIN.MAX_WARN
    const input = args[0].toLowerCase();
    if (!["limit", "action"].includes(input)) return message.safeReply(data.lang.INVALID_USAGE);

    let response;
    if (input === "limit") {
      const max = parseInt(args[1]);
      if (isNaN(max) || max < 1) return message.safeReply(l.ERR);
      response = await setLimit(max, data.settings, data.lang);
    }

    if (input === "action") {
      const action = args[1]?.toUpperCase();
      if (!action || !["TIMEOUT", "KICK", "BAN"].includes(action))
        return message.safeReply(l.ERR2);
      response = await setAction(message.guild, action, data.settings, data.lang);
    }

    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();

    let response;
    if (sub === "limit") {
      response = await setLimit(interaction.options.getInteger("amount"), data.settings, data.lang);
    }

    if (sub === "action") {
      response = await setAction(interaction.guild, interaction.options.getString("action"), data.settings, data.lang);
    }

    await interaction.followUp(response);
  },
};

async function setLimit(limit, settings, lang) {
    

    let l = lang.COMMANDS.ADMIN.MAX_WARN
  settings.max_warn.limit = limit;
  await settings.save();
  return `${l.DONE} ${limit}`;
}

async function setAction(guild, action, settings, lang) {
    let l = lang.COMMANDS.ADMIN.MAX_WARN
  if (action === "TIMEOUT") {
    if (!guild.members.me.permissions.has("ModerateMembers")) {
      return l.ERR3;
    }
  }

  if (action === "KICK") {
    if (!guild.members.me.permissions.has("KickMembers")) {
      return l.ERR3;
    }
  }

  if (action === "BAN") {
    if (!guild.members.me.permissions.has("BanMembers")) {
      return l.ERR3;
    }
  }

  settings.max_warn.action = action;
  await settings.save();
  return l.DONE + action;
}
