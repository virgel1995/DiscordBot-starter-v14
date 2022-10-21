const { softbanTarget } = require("@helpers/ModUtils");
const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "softban",
  description: "softban the specified member. Kicks and deletes messages",
  category: "MODERATION",
  botPermissions: ["BanMembers"],
  userPermissions: ["KickMembers"],
  command: {
    enabled: true,
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
        description: "reason for softban",
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],
  },

  async messageRun(message, args, data) {
    const target = await message.guild.resolveMember(args[0], true);
    if (!target) return message.safeReply(data.lang.NO_USER.replace("{args}", args[0] ));
    const reason = message.content.split(args[0])[1].trim();
    const response = await softban(message.member, target, reason, data.lang);
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");
    const target = await interaction.guild.members.fetch(user.id);

    const response = await softban(interaction.member, target, reason, data.lang);
    await interaction.followUp(response);
  },
};

async function softban(issuer, target, reason, lang) {
    
   let l = lang.COMMANDS.MODERATION.SOFT_BAN
  const response = await softbanTarget(issuer, target, reason);
  if (typeof response === "boolean") return `${target.user.tag} ` + l.ERR;
  if (response === "BOT_PERM") return l.PERMS` ${target.user.tag}`;
  else if (response === "MEMBER_PERM") return l.PERMS2 + ` ${target.user.tag}`;
  else return l.FAIL` ${target.user.tag}`;
}
