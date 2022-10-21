/**
 * @param {import('discord.js').GuildMember} member
 * @param {string} messageId
 */
module.exports = async (member, messageId,lang) => {

 let l = lang.COMMANDS.GIVEAWAYS.SUB.REROLL
  if (!messageId) return l.ERR;

  // Permissions
  if (!member.permissions.has("ManageMessages")) {
    return l.PERMS;
  }

  // Search with messageId
  const giveaway = member.client.giveawaysManager.giveaways.find(
    (g) => g.messageId === messageId && g.guildId === member.guild.id
  );

  // If no giveaway was found
  if (!giveaway) return l.ERR2`: ${messageId}`;

  // Check if the giveaway is ended
  if (!giveaway.ended) return l.ERR3;

  try {
    await giveaway.reroll();
    return l.DONE;
  } catch (error) {
    member.client.logger.error("Giveaway Reroll", error);
    return l.ERR4 `: ${error.message}`;
  }
};
