const { canModerate } = require("@helpers/ModUtils");
const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "nick",
  description: "nickname commands",
  category: "MODERATION",
  botPermissions: ["ManageNicknames"],
  userPermissions: ["ManageNicknames"],
  command: {
    enabled: true,
    minArgsCount: 2,
    subcommands: [
      {
        trigger: "set <@member> <name>",
        description: "sets the nickname of the specified member",
      },
      {
        trigger: "reset <@member>",
        description: "reset a members nickname",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "set",
        description: "change a members nickname",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user",
            description: "the member whose nick you want to set",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
          {
            name: "name",
            description: "the nickname to set",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "reset",
        description: "reset a members nickname",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user",
            description: "the members whose nick you want to reset",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args, data) {
  
   let l = data.lang.COMMANDS.MODERATION.NICK
    const sub = args[0].toLowerCase();

    if (sub === "set") {
      const target = await message.guild.resolveMember(args[1]);
      if (!target) return message.safeReply(data.lang.NO_USER.replace("{args}", args[1]));
      const name = args.slice(2).join(" ");
      if (!name) return message.safeReply(l.ERR);

      const response = await nickname(message, target, name, data.lang);
      return message.safeReply(response);
    }

    //
    else if (sub === "reset") {
      const target = await message.guild.resolveMember(args[1]);
      if (!target) return message.safeReply(data.lang.NO_USER.replace("{args}", args[1]));

      const response = await nickname(message, target, data.lang);
      return message.safeReply(response);
    }
  },

  async interactionRun(interaction, data) {
    const name = interaction.options.getString("name");
    const target = await interaction.guild.members.fetch(interaction.options.getUser("user"));

    const response = await nickname(interaction, target, name, data.lang);
    await interaction.followUp(response);
  },
};

async function nickname({ member, guild }, target, name, lang) {
    
   let l = lang.COMMANDS.MODERATION.NICK
  if (!canModerate(member, target)) {
    return l.ERR2 + ` ${target.user.tag}`;
  }
  if (!canModerate(guild.members.me, target)) {
    return l.ERR3 + ` ${target.user.tag}`;
  }

  try {
    await target.setNickname(name);
    return l.SUCCESS + ` ${name ? lang.CHANGED : lang.RESET} ${l.SUCCESS2} ${target.user.tag}`;
  } catch (ex) {
    return l.FAIL + ` ${name ? lang.CHANGE : lang.RESET} ${l.FAIL2} ${target.displayName}. ` + l.FAIL3;
  }
}
