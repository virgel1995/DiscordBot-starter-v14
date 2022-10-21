const { EmbedBuilder, ChannelType } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");
const { stripIndent } = require("common-tags");
const channelTypes = require("@helpers/channelTypes");

/**
 * @param {import('discord.js').GuildChannel} channel
 */
module.exports = (channel, lang) => {
       let l = lang.COMMANDS.INFORMATION.SHARED.CHANNELINFO
  const { id, name, parent, position, type } = channel;

  let desc = stripIndent`
      ❯ ${l.ID} : **${id}**
      ❯ ${l.NAME} : **${name}**
      ❯ ${l.TYPE} : **${channelTypes(channel.type)}**
      ❯ ${l.CAT} : **${parent || "NA"}**\n
      `;

  if (type === ChannelType.GuildText) {
    const { rateLimitPerUser, nsfw } = channel;
    desc += stripIndent`
      ❯ ${l.TOPIC} : **${channel.topic || "No topic set"}**
      ❯ ${l.POSITION} : **${position}**
      ❯ ${l.SLOWMODE} : **${rateLimitPerUser}**
      ❯ ${l.ISNSFW} : **${nsfw ? "✓" : "✕"}**\n
      `;
  }

  if (type === ChannelType.GuildPublicThread || type === ChannelType.GuildPrivateThread) {
    const { ownerId, archived, locked } = channel;
    desc += stripIndent`
      ❯ ${l.OWNERID} : **${ownerId}**
      ❯ ${l.ARCHIVED} : **${archived ? "✓" : "✕"}**
      ❯ ${l.LOCKED} : **${locked ? "✓" : "✕"}**\n
      `;
  }

  if (type === ChannelType.GuildNews || type === ChannelType.GuildNewsThread) {
    const { nsfw } = channel;
    desc += stripIndent`
      ❯ ${l.ISNSFW} : **${nsfw ? "✓" : "✕"}**\n
      `;
  }

  if (type === ChannelType.GuildVoice || type === ChannelType.GuildStageVoice) {
    const { bitrate, userLimit, full } = channel;
    desc += stripIndent`
      ❯ ${l.POSITION} : **${position}**
      ❯ ${l.BITRATE} : **${bitrate}**
      ❯ ${l.USERLIMIT}: **${userLimit}**
      ❯ ${l.FULL} : **${full ? "✓" : "✕"}**\n
      `;
  }

  const embed = new EmbedBuilder()
    .setAuthor({ name: l.AUTHOR })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(desc);

  return { embeds: [embed] };
};
