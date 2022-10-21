const { getEffectiveInvites, checkInviteRewards } = require("@handlers/invite");
const { EMBED_COLORS } = require("@root/config.js");
const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { getMember } = require("@schemas/Member");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "addinvites",
  description: "add invites to a member",
  category: "INVITE",
  userPermissions: ["ManageGuild"],
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    usage: "<@member|id> <invites>",
    minArgsCount: 2,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "user",
        description: "the user to give invites to",
        type: ApplicationCommandOptionType.User,
        required: true,
      },
      {
        name: "invites",
        description: "the number of invites to give",
        type: ApplicationCommandOptionType.Integer,
        required: true,
      },
    ],
  },

  async messageRun(message, args, data) {
      let l = data.lang.COMMANDS.INVITES.ADD
    const target = await message.guild.resolveMember(args[0], true);
    const amount = parseInt(args[1]);

    if (!target) return message.safeReply(l.NOMENTION);
    if (isNaN(amount)) return message.safeReply(l.NUMBER);

    const response = await addInvites(message, target.user, parseInt(amount), data.lang);
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
      

      let l = data.lang.COMMANDS.INVITES.ADD
    const user = interaction.options.getUser("user");
    const amount = interaction.options.getInteger("invites");
    const response = await addInvites(interaction, user, amount, data.lang);
    await interaction.followUp(response);
  },
};

async function addInvites({ guild }, user, amount, lang) {
    
      let l = lang.COMMANDS.INVITES.ADD
  if (user.bot) return l.ERR;

  const memberDb = await getMember(guild.id, user.id);
  memberDb.invite_data.added += amount;
  await memberDb.save();

  const embed = new EmbedBuilder()
    .setAuthor({ name: l.AUTHER + ` ${user.username}` })
    .setThumbnail(user.displayAvatarURL())
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(`${user.tag} ${l.DESC} ${getEffectiveInvites(memberDb.invite_data)} ${l.DESC2}`);

  checkInviteRewards(guild, memberDb, true);
  return { embeds: [embed] };
}
