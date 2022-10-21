const { EmbedBuilder } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");

/**
 * @param {import('discord.js').GuildMember} member
 */
module.exports = (member, lang) => {
       let l = lang.COMMANDS.INFORMATION.SHARED.USERINFO
  let color = member.displayHexColor;
  if (color === "#000000") color = EMBED_COLORS.BOT_EMBED;

  let rolesString = member.roles.cache.map((r) => r.name).join(", ");
  if (rolesString.length > 1024) rolesString = rolesString.substring(0, 1020) + "...";

  const embed = new EmbedBuilder()
    .setAuthor({
      name: l.AUTHOR + ` ${member.displayName}`,
      iconURL: member.user.displayAvatarURL(),
    })
    .setThumbnail(member.user.displayAvatarURL())
    .setColor(color)
    .addFields(
      {
        name: l.F1 ,
        value: member.user.tag,
        inline: true,
      },
      {
        name: l.F2,
        value: member.id,
        inline: true,
      },
      {
        name: l.F3,
        value: member.joinedAt.toUTCString(),
      },
      {
        name: l.F4,
        value: member.user.createdAt.toUTCString(),
      },
      {
        name: l.F5 + ` [${member.roles.cache.size}]`,
        value: rolesString,
      },
      {
        name: l.F6,
        value: member.user.displayAvatarURL({ extension: "png" }),
      }
    )
    .setFooter({ text: member.user.tag })
    .setTimestamp(Date.now());

  return { embeds: [embed] };
};
