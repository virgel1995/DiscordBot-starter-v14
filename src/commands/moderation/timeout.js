const { timeoutTarget } = require("@helpers/ModUtils");
const { ApplicationCommandOptionType } = require("discord.js");
const ems = require("enhanced-ms");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "timeout",
  description: "timeouts the specified member",
  category: "MODERATION",
  botPermissions: ["ModerateMembers"],
  userPermissions: ["ModerateMembers"],
  command: {
    enabled: true,
    aliases: ["mute"],
    usage: "<ID|@member> <duration> [reason]",
    minArgsCount: 2,
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
        name: "duration",
        description: "the time to timeout the member for",
        type: ApplicationCommandOptionType.String,
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
      
   let l = data.lang.COMMANDS.MODERATION.TIMEOUT
    const target = await message.guild.resolveMember(args[0], true);
    if (!target) return message.safeReply(data.lang.NO_USER.replace("{args}", args[0] ));

    // parse time
    const ms = ems(args[1]);
    if (!ms) return message.safeReply(l.ERR);

    const reason = args.slice(2).join(" ").trim();
    const response = await timeout(message.member, target, ms, reason, data.lang);
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
   
   let l = data.lang.COMMANDS.MODERATION.TIMEOUT
    const user = interaction.options.getUser("user");

    // parse time
    const duration = interaction.options.getString("duration");
    const ms = ems(duration);
    if (!ms) return interaction.followUp(l.ERR);

    const reason = interaction.options.getString("reason");
    const target = await interaction.guild.members.fetch(user.id);

    const response = await timeout(interaction.member, target, ms, reason, data.lang);
    await interaction.followUp(response);
  },
};

async function timeout(issuer, target, ms, reason, lang) {
 
   let l = lang.COMMANDS.MODERATION.TIMEOUT
  if (!NaN(Number(ms))) return l.ERR;
  const response = await timeoutTarget(issuer, target, ms, reason);
  if (typeof response === "boolean") return `${target.user.tag} ` + l.ERR;
  if (response === "BOT_PERM") return l.PERMS + ` ${target.user.tag}`;
  else if (response === "MEMBER_PERM") return l.PERMS2 ` ${target.user.tag}`;
  else if (response === "ALREADY_TIMEOUT") return `${target.user.tag} ` + l.FAIL ;
  else return l.FAIL2 + ` ${target.user.tag}`;
}
