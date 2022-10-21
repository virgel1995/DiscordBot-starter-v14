const { getEffectiveInvites } = require("@handlers/invite");
const { EMBED_COLORS } = require("@root/config.js");
const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { stripIndent } = require("common-tags");
const { getMember } = require("@schemas/Member");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "inviter",
  description: "shows inviter information",
  category: "INVITE",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    usage: "[@member|id]",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "user",
        description: "the user to get the inviter information for",
        type: ApplicationCommandOptionType.User,
        required: false,
      },
    ],
  },

  async messageRun(message, args, data) {
    const target = (await message.guild.resolveMember(args[0])) || message.member;
    const response = await getInviter(message, target.user, data.settings, data.lang);
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const user = interaction.options.getUser("user") || interaction.user;
    const response = await getInviter(interaction, user, data.settings, data.lang);
    await interaction.followUp(response);
  },
};

async function getInviter({ guild }, user, settings, lang) {
    
      let l = lang.COMMANDS.INVITES.INVITER
  if (!settings.invite.tracking) return l.ERR;

  const inviteData = (await getMember(guild.id, user.id)).invite_data;
  if (!inviteData || !inviteData.inviter) return l.ERR2 + ` \`${user.tag}\`` + l.ERR3;

  const inviter = await guild.client.users.fetch(inviteData.inviter, false, true);
  const inviterData = (await getMember(guild.id, inviteData.inviter)).invite_data;

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor({ name: l.AUTHOR + ` ${user.username}` })
    .setDescription(
      stripIndent`
     ${l.F1} : \`${inviter?.tag || "Deleted User"}\`
     ${l.F2} : \`${inviteData.inviter}\`
     ${l.F3}: \`${inviteData.code}\`
     ${l.F4} : \`${getEffectiveInvites(inviterData)}\`
      `
    );

  return { embeds: [embed] };
}
