const { addReactionRole, getReactionRoles } = require("@schemas/ReactionRoles");
const { parseEmoji, ApplicationCommandOptionType, ChannelType } = require("discord.js");
const { parsePermissions } = require("@helpers/Utils");

const channelPerms = ["EmbedLinks", "ReadMessageHistory", "AddReactions", "UseExternalEmojis", "ManageMessages"];

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "addrr",
  description: "setup reaction role for the specified message",
  category: "ADMIN",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    usage: "<#channel> <messageId> <emote> <role>",
    minArgsCount: 4,
  },
  slashCommand: {
    enabled: true,
    ephemeral: false,
    options: [
      {
        name: "channel",
        description: "channel where the message exists",
        type: ApplicationCommandOptionType.Channel,
        channelTypes: [ChannelType.GuildText],
        required: true,
      },
      {
        name: "message_id",
        description: "message id to which reaction roles must be configured",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: "emoji",
        description: "emoji to use",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: "role",
        description: "role to be given for the selected emoji",
        type: ApplicationCommandOptionType.Role,
        required: true,
      },
    ],
  },

  async messageRun(message, args, data) {
    const targetChannel = message.guild.findMatchingChannels(args[0]);
    if (targetChannel.length === 0) return message.safeReply(` ${data.lang.ADMIN.REACTION_ROLL.ADD.NO_CH} ${args[0]}`);

    const targetMessage = args[1];

    const role = message.guild.findMatchingRoles(args[3])[0];
    if (!role) return message.safeReply(`${data.lang.ADMIN.REACTION_ROLL.ADD.NO_ROLE} ${args[3]}`);

    const reaction = args[2];

    const response = await addRR(message.guild, targetChannel[0], targetMessage, reaction, role, data.lang);
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const targetChannel = interaction.options.getChannel("channel");
    const messageId = interaction.options.getString("message_id");
    const reaction = interaction.options.getString("emoji");
    const role = interaction.options.getRole("role");

    const response = await addRR(interaction.guild, targetChannel, messageId, reaction, role, data.lang);
    await interaction.followUp(response);
  },
};

async function addRR(guild, channel, messageId, reaction, role, lang) {
	let l = lang.COMMANDS.ADMIN.REACTION_ROLL.ADD
  if (!channel.permissionsFor(guild.members.me).has(channelPerms)) {
    return `${l.NEED_PERMS} ${channel.toString()}\n${parsePermissions(channelPerms)}`;
  }

  let targetMessage;
  try {
    targetMessage = await channel.messages.fetch({ message: messageId });
  } catch (ex) {
    return l.ERR_ID;
  }

  if (role.managed) {
    return l.BOT_ROLES;
  }

  if (guild.roles.everyone.id === role.id) {
    return l.EVERY_ROLE ;
  }

  if (guild.members.me.roles.highest.position < role.position) {
    return l.ROLE_POSTION;
  }

  const custom = parseEmoji(reaction);
  if (custom.id && !guild.emojis.cache.has(custom.id)) return l.EMOJI_OUTSERVER;
  const emoji = custom.id ? custom.id : custom.name;

  try {
    await targetMessage.react(emoji);
  } catch (ex) {
    return `${l.FAIL_REACT}: ${reaction} ?`;
  }

  let reply = "";
  const previousRoles = getReactionRoles(guild.id, channel.id, targetMessage.id);
  if (previousRoles.length > 0) {
    const found = previousRoles.find((rr) => rr.emote === emoji);
    if (found) reply = l.ROLE_CONFIGED ;
  }

  await addReactionRole(guild.id, channel.id, targetMessage.id, emoji, role.id);
  return (reply += l.DONE);
}
