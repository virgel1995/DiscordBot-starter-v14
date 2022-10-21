const { EMBED_COLORS } = require("@root/config");

/**
 * @param {import('discord.js').GuildMember} member
 */
module.exports = async (member, lang) => {
 
 let l = lang.COMMANDS.GIVEAWAYS.SUB.LIST
  // Permissions
  if (!member.permissions.has("ManageMessages")) {
    return l.PERMS;
  }

  // Search with all giveaways
  const giveaways = member.client.giveawaysManager.giveaways.filter(
    (g) => g.guildId === member.guild.id && g.ended === false
  );

  // No giveaways
  if (giveaways.length === 0) {
    return l.NO_GIVE;
  }

  const description = giveaways.map((g, i) => `${i + 1}. ${g.prize} ${l.IN} <#${g.channelId}>`).join("\n");

  try {
    return { embeds: [{ description, color: EMBED_COLORS.GIVEAWAYS }] };
  } catch (error) {
    member.client.logger.error("Giveaway List", error);
    return l.ERR + `: ${error.message}`;
  }
};
