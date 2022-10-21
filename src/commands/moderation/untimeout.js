const { unTimeoutTarget } = require("@helpers/ModUtils");
const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "untimeout",
  description: "remove timeout from a member",
  category: "MODERATION",
  botPermissions: ["ModerateMembers"],
  userPermissions: ["ModerateMembers"],
  command: {
    enabled: true,
    aliases: ["unmute"],
    usage: "<ID|@member> [reason]",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "user",
        description: "the target member",
        type: ApplicationCommandOptionType.User,
        required: true,
      },
      {
        name: "reason",
        description: "reason for timeout",
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],
  },

  async messageRun(message, args, data) {
    const target = await message.guild.resolveMember(args[0], true);
    if (!target) return message.safeReply(data.lang.NO_USER.replace("{args}", args[0] ));
    const reason = args.slice(1).join(" ").trim();
    const response = await untimeout(message.member, target, reason, data.lang);
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");
    const target = await interaction.guild.members.fetch(user.id);

    const response = await untimeout(interaction.member, target, reason, data.lang);
    await interaction.followUp(response);
  },
};

async function untimeout(issuer, target, reason, lang) {
 
   let l = lang.COMMANDS.MODERATION.UNTIMEOUT
  const response = await unTimeoutTarget(issuer, target, reason);
  if (typeof response === "boolean") return l.GO + ` ${target.user.tag} ` + l.GO2;
  if (response === "BOT_PERM") return l.PERMS + ` ${target.user.tag}`;
  else if (response === "MEMBER_PERM") return l.PERMS2 + ` ${target.user.tag}`;
  else if (response === "NO_TIMEOUT") return `${target.user.tag} ` + l.ERR;
  else return l.FAIL + ` ${target.user.tag}`;
}
