const { getEffectiveInvites } = require("@handlers/invite");
const { EMBED_COLORS } = require("@root/config.js");
const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { getMember } = require("@schemas/Member");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "invites",
  description: "shows number of invites in this server",
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
        description: "the user to get the invites for",
        type: ApplicationCommandOptionType.User,
        required: false,
      },
    ],
  },

  async messageRun(message, args, data) {
    const target = (await message.guild.resolveMember(args[0])) || message.member;
    const response = await getInvites(message, target.user, data.settings, data.lang);
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const user = interaction.options.getUser("user") || interaction.user;
    const response = await getInvites(interaction, user, data.settings, data.lang);
    await interaction.followUp(response);
  },
};

async function getInvites({ guild }, user, settings, lang) {
    
      let l = lang.COMMANDS.INVITES.INVITES
  if (!settings.invite.tracking) return l.ERR ;

  const inviteData = (await getMember(guild.id, user.id)).invite_data;

  const embed = new EmbedBuilder()
    .setAuthor({ name: l.AUTHOR + ` ${user.username}` })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setThumbnail(user.displayAvatarURL())
    .setDescription(`${user.toString()}  => ${getEffectiveInvites(inviteData)} ${l.INV}`)
    .addFields(
      {
        name: l.F1 ,
        value: `**${inviteData?.tracked + inviteData?.added || 0}**`,
        inline: true,
      },
      {
        name: l.F2 ,
        value: `**${inviteData?.fake || 0}**`,
        inline: true,
      },
      {
        name: l.F3,
        value: `**${inviteData?.left || 0}**`,
        inline: true,
      }
    );

  return { embeds: [embed] };
}
