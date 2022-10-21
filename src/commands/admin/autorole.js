const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "autorole",
  description: "setup role to be given when a member joins the server",
  category: "ADMIN",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    usage: "<role|off>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    ephemeral: false,
    options: [
      {
        name: "add",
        description: "setup the autorole",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "role",
            description: "the role to be given",
            type: ApplicationCommandOptionType.Role,
            required: false,
          },
          {
            name: "role_id",
            description: "the role id to be given",
            type: ApplicationCommandOptionType.String,
            required: false,
          },
        ],
      },
      {
        name: "remove",
        description: "disable the autorole",
        type: ApplicationCommandOptionType.Subcommand,
      },
    ],
  },

  async messageRun(message, args, data) {
    const input = args.join(" ");
    let response;
let l = data.lang.COMMANDS.ADMIN.AUTO_ROLE
    if (input.toLowerCase() === "off") {
      response = await setAutoRole(message, null, data.settings, data.lang);
    } else {
      const roles = message.guild.findMatchingRoles(input);
      if (roles.length === 0) response = l.NOT_MATCH ;
      else response = await setAutoRole(message, roles[0], data.settings, data.lang);
    }

    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();
    let response;
let l = data.lang.COMMANDS.ADMIN.AUTO_ROLE

    // add
    if (sub === "add") {
      let role = interaction.options.getRole("role");
      if (!role) {
        const role_id = interaction.options.getString("role_id");
        if (!role_id) return interaction.followUp(l.NO_ID);

        const roles = interaction.guild.findMatchingRoles(role_id);
        if (roles.length === 0) return interaction.followUp(l.NOT_MATCH);
        role = roles[0];
      }

      response = await setAutoRole(interaction, role, data.settings, data.lang);
    }

    // remove
    else if (sub === "remove") {
      response = await setAutoRole(interaction, null, data.settings, data.lang);
    }

    // default
    else response = data.lang.INVALID_SUB;

    await interaction.followUp(response);
  },
};

async function setAutoRole({ guild }, role, settings, lang) {
   let l = lang.COMMANDS.ADMIN.AUTO_ROLE
  if (role) {
let l = lang.COMMANDS.ADMIN.AUTO_ROLE
    if (!guild.members.me.permissions.has("ManageRoles")) return l.NO_PERMS;
    if (guild.members.me.roles.highest.position < role.position)
      return l.NO_PERMS2;
    if (role.managed) return l.ERR;
  }

  if (!role) settings.autorole = null;
  else settings.autorole = role.id;

  await settings.save();
  return `Configuration saved! Autorole is ${!role ? lang.ENABLED : lang.DISABLED}`;
}
