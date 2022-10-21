const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "flagtranslation",
  description: "configure flag translation in the server",
  category: "ADMIN",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    aliases: ["flagtr"],
    minArgsCount: 1,
    usage: "<on|off>",
  },
  slashCommand: {
    enabled: true,
    ephemeral: false,
    options: [
      {
        name: "status",
        description: "enabled or disabled",
        required: true,
        type: ApplicationCommandOptionType.String,
        choices: [
          {
            name: "ON",
            value: "ON",
          },
          {
            name: "OFF",
            value: "OFF",
          },
        ],
      },
    ],
  },

  async messageRun(message, args, data) {
    const status = args[0].toLowerCase();
    if (!["on", "off"].includes(status)) return message.safeReply(data.lang.INVALID_STATUS);

    const response = await setFlagTranslation(status, data.settings, data.lang);
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const response = await setFlagTranslation(interaction.options.getString("status"), data.settings, data.lang);
    await interaction.followUp(response);
  },
};

async function setFlagTranslation(input, settings, lang) {
  const status = input.toLowerCase() === "on" ? true : false;

  settings.flag_translation.enabled = status;
  await settings.save();

  return `${lang.COMMANDS.ADMIN.FALG_TRANS} ${status ? lang.ENABLED : lang.DISABLED}`;
}
