const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "setprefix",
  description: "sets a new prefix for this server",
  category: "ADMIN",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    usage: "<new-prefix>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    ephemeral: false,
    options: [
      {
        name: "newprefix",
        description: "the new prefix to set",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args, data) {
    const newPrefix = args[0];
    const response = await setNewPrefix(newPrefix, data.settings, data.lang);
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const response = await setNewPrefix(interaction.options.getString("newprefix"), data.settings, data.lang);
    await interaction.followUp(response);
  },
};

async function setNewPrefix(newPrefix, settings, lang) {
  if (newPrefix.length > 2) return lang.COMMANDS.ADMIN.SET_PREFIX.ERR;
  settings.prefix = newPrefix;
  await settings.save();

  return `${lang.COMMANDS.ADMIN.SET_PREFIX.DONE} \`${newPrefix}\``;
}
