/**
 * @param {import('discord.js').GuildMember} member
 * @param {string} messageId
 * @param {number} addDuration
 * @param {string} newPrize
 * @param {number} newWinnerCount
 */
module.exports = async (member, messageId, addDuration, newPrize, newWinnerCount, lang) => {
 let l = lang.COMMANDS.GIVEAWAYS.SUB.EDIT
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
  if (!giveaway) return l.ERR2 + `: ${messageId}`;

  try {
    await member.client.giveawaysManager.edit(messageId, {
      addTime: addDuration || 0,
      newPrize: newPrize || giveaway.prize,
      newWinnerCount: newWinnerCount || giveaway.winnerCount,
    });

    return l.DONE;
  } catch (error) {
    member.client.logger.error("Giveaway Edit", error);
    return l.ERR3 + `: ${error.message}`;
  }
};
