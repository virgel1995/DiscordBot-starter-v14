const { banTarget } = require("@helpers/ModUtils");
const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "ban",
  description: "bans the specified member",
  category: "MODERATION",
  botPermissions: ["BanMembers"],
  userPermissions: ["BanMembers"],
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
        description: "reason for ban",
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],
  },

  async messageRun(message, args, data) {
   let l = data.lang.COMMANDS.MODERATION.BAN
    const match = await message.client.resolveUsers(args[0], true);
    const target = match[0];
    if (!target) return message.safeReply(data.lang.NO_USER.replace("{args}", args[0] ));
    const reason = message.content.split(args[0])[1].trim();
    const response = await ban(message.member, target, reason, data.lang);
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const target = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");

    const response = await ban(interaction.member, target, reason, data.lang);
    await interaction.followUp(response);
  },
};

/**
 * @param {import('discord.js').GuildMember} issuer
 * @param {import('discord.js').User} target
 * @param {string} reason
 */
async function ban(issuer, target, reason, lang) {
  

   let l = lang.COMMANDS.MODERATION.BAN
  const response = await banTarget(issuer, target, reason);
  if (typeof response === "boolean") return `${target.tag} ` + l.ERR;
  if (response === "BOT_PERM") return l.PERMS ` ${target.tag}`;
  else if (response === "MEMBER_PERM") return l.PERMS2`${target.tag}`;
  else return l.FAIL + ` ${target.tag}`;
}
