const { ChannelType } = require("discord.js");

/**
 * @param {import('discord.js').GuildMember} member
 * @param {import('discord.js').GuildTextBasedChannel} giveawayChannel
 * @param {number} duration
 * @param {string} prize
 * @param {number} winners
 * @param {import('discord.js').User} [host]
 * @param {string[]} [allowedRoles]
 */
module.exports = async (member, giveawayChannel, duration, prize, winners, host, allowedRoles = [], lang) => {
  
 let l = lang.COMMANDS.GIVEAWAYS.SUB.START
  try {
    if (!host) host = member.user;
    if (!member.permissions.has("ManageMessages")) {
      return l.PERMS;
    }

    if (!giveawayChannel.type === ChannelType.GuildText) {
      return l.ERR;
    }

    /**
     * @type {import("discord-giveaways").GiveawayStartOptions}
     */
    const options = {
      duration: duration,
      prize,
      winnerCount: winners,
      hostedBy: host,
      thumbnail: "https://i.imgur.com/DJuTuxs.png",
      messages: {
        giveaway: l.F1,
        giveawayEnded: l.F2,
        inviteToParticipate: l.F3,
        dropMessage: l.F4,
        hostedBy: `\n${l.F5}: ${host.tag}`,
      },
    };

    if (allowedRoles.length > 0) {
      options.exemptMembers = (member) => !member.roles.cache.find((role) => allowedRoles.includes(role.id));
    }

    await member.client.giveawaysManager.start(giveawayChannel, options);
    return l.DONE + ` ${giveawayChannel}`;
  } catch (error) {
    member.client.logger.error("Giveaway Start", error);
    return l.ERR2 + `: ${error.message}`;
  }
};
