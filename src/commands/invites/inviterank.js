const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "inviterank",
  description: "configure invite ranks",
  category: "INVITE",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    usage: "<role-name> <invites>",
    minArgsCount: 2,
    subcommands: [
      {
        trigger: "add <role> <invites>",
        description: "add auto-rank after reaching a particular number of invites",
      },
      {
        trigger: "remove role",
        description: "remove invite rank configured with that role",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "add",
        description: "add a new invite rank",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "role",
            description: "role to be given",
            type: ApplicationCommandOptionType.Role,
            required: true,
          },
          {
            name: "invites",
            description: "number of invites required to obtain the role",
            type: ApplicationCommandOptionType.Integer,
            required: true,
          },
        ],
      },
      {
        name: "remove",
        description: "remove a previously configured invite rank",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "role",
            description: "role with configured invite rank",
            type: ApplicationCommandOptionType.Role,
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args, data) {
      
      let l = data.lang.COMMANDS.INVITES.RANK
    const sub = args[0].toLowerCase();

    if (sub === "add") {
      const query = args[1];
      const invites = args[2];

      if (isNaN(invites)) return message.safeReply(`\`${invites}\` ` + l.ERR);
      const role = message.guild.findMatchingRoles(query)[0];
      if (!role) return message.safeReply(l.ERR2 + ` \`${query}\``);

      const response = await addInviteRank(message, role, invites, data.settings, data.lang);
      await message.safeReply(response);
    }

    //
    else if (sub === "remove") {
      const query = args[1];
      const role = message.guild.findMatchingRoles(query)[0];
      if (!role) return message.safeReply(l.ERR2 + ` \`${query}\``);
      const response = await removeInviteRank(message, role, data.settings, data.lang);
      await message.safeReply(response);
    }

    //
    else {
      await message.safeReply(data.lang.INVALID_USAGE);
    }
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();
    //
    if (sub === "add") {
      const role = interaction.options.getRole("role");
      const invites = interaction.options.getInteger("invites");

      const response = await addInviteRank(interaction, role, invites, data.settings, data.lang);
      await interaction.followUp(response);
    }

    //
    else if (sub === "remove") {
      const role = interaction.options.getRole("role");
      const response = await removeInviteRank(interaction, role, data.settings, data.lang);
      await interaction.followUp(response);
    }
  },
};

async function addInviteRank({ guild }, role, invites, settings, lang) {
    
      let l = lang.COMMANDS.INVITES.RANK
  if (!settings.invite.tracking) return l.ERR3 ;

  if (role.managed) {
    return l.ERR4 ;
  }

  if (guild.roles.everyone.id === role.id) {
    return l.ERR5 ;
  }

  if (!role.editable) {
    return l.ERR6;
  }

  const exists = settings.invite.ranks.find((obj) => obj._id === role.id);

  let msg = "";
  if (exists) {
    exists.invites = invites;
    msg += l.ERR7 ;
  }

  settings.invite.ranks.push({ _id: role.id, invites });
  await settings.save();
  return msg + l.SUCCESS;
}

async function removeInviteRank({ guild }, role, settings, lang) {
    
      let l = lang.COMMANDS.INVITES.RANK
  if (!settings.invite.tracking) return l.ERR3 ;

  if (role.managed) {
    return l.ERR4;
  }

  if (guild.roles.everyone.id === role.id) {
    return l.ERR5 ;
  }

  if (!role.editable) {
    return l.ERR6 ;
  }

  const exists = settings.invite.ranks.find((obj) => obj._id === role.id);
  if (!exists) return l.ERR8;

  // delete element from array
  const i = settings.invite.ranks.findIndex((obj) => obj._id === role.id);
  if (i > -1) settings.invite.ranks.splice(i, 1);

  await settings.save();
  return l.SUCCESS ;
}
