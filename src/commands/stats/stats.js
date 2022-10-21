const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { getMemberStats } = require("@schemas/MemberStats");
const { EMBED_COLORS } = require("@root/config");
const { stripIndents } = require("common-tags");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "stats",
  description: "displays members stats in this server",
  cooldown: 5,
  category: "STATS",
  command: {
    enabled: true,
    usage: "[@member|id]",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "user",
        description: "target user",
        type: ApplicationCommandOptionType.User,
        required: false,
      },
    ],
  },

  async messageRun(message, args, data) {
    const target = (await message.guild.resolveMember(args[0])) || message.member;
    const response = await stats(target, data.settings, data.lang);
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const member = interaction.options.getMember("user") || interaction.member;
    const response = await stats(member, data.settings, data.lang);
    await interaction.followUp(response);
  },
};

/**
 * @param {import('discord.js').GuildMember} member
 * @param {object} settings
 */
async function stats(member, settings, lang) {
    const l = lang.COMMANDS.STATS.STATS
  if (!settings.stats.enabled) return l.DISABLED;
  const memberStats = await getMemberStats(member.guild.id, member.id);

  const embed = new EmbedBuilder()
    .setThumbnail(member.user.displayAvatarURL())
    .setColor(EMBED_COLORS.BOT_EMBED)
    .addFields(
      {
        name: l.F1,
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
        value: member.joinedAt.toLocaleString(),
        inline: false,
      },
      {
        name: l.F4 ,
        value: stripIndents`
      ❯ ${l.Desc} : ${memberStats.messages}
      ❯ ${l.Desc1}: ${memberStats.commands.prefix}
      ❯ ${l.Desc2}: ${memberStats.commands.slash}
      ❯ ${l.Desc3} : ${memberStats.xp}
      ❯ ${l.Desc4} : ${memberStats.level}
    `,
        inline: false,
      },
      {
        name: l.F5,
        value: stripIndents`
      ❯ ${l.Desc5}: ${memberStats.voice.connections}
      ❯ ${l.Desc6}: ${Math.floor(memberStats.voice.time / 60)} min
    `,
      }
    )
    .setFooter({ text: l.FOOTER })
    .setTimestamp();

  return { embeds: [embed] };
}
