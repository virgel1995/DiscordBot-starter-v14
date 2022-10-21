const { getMember } = require("@schemas/Member");
const { ApplicationCommandOptionType } = require("discord.js");
const { checkInviteRewards } = require("@handlers/invite");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "resetinvites",
  description: "clear a users added invites",
  category: "INVITE",
  userPermissions: ["ManageGuild"],
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    usage: "<@member>",
    aliases: ["clearinvites"],
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "user",
        description: "the user to clear invites for",
        type: ApplicationCommandOptionType.User,
        required: true,
      },
    ],
  },

  async messageRun(message, args, data) {
    
      let l = data.lang.COMMANDS.INVITES.REST
    const target = await message.guild.resolveMember(args[0], true);
    if (!target) return message.safeReply(l.ERR );
    const response = await clearInvites(message, target.user, data.lang);
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const user = interaction.options.getUser("user");
    const response = await clearInvites(interaction, user, data.lang);
    await interaction.followUp(response);
  },
};

async function clearInvites({ guild }, user, lang) {
 
      let l = lang.COMMANDS.INVITES.REST
  const memberDb = await getMember(guild.id, user.id);
  memberDb.invite_data.added = 0;
  await memberDb.save();
  checkInviteRewards(guild, memberDb, false);
  return l.DONE + ` \`${user.tag}\``;
}
