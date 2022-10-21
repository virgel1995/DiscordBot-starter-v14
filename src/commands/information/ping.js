/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "ping",
  description: "shows the current ping from the bot to the discord servers",
  category: "INFORMATION",
  command: {
    enabled: true,
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [],
  },

  async messageRun(message, args,data) {
    await message.safeReply(data.lang.COMMANDS.INFORMATION.PING_COMMAND.REPLY.replace("{ping}", Math.floor(message.client.ws.ping)));
  },

  async interactionRun(interaction,data) {
    await interaction.followUp(data.lang.COMMANDS.INFORMATION.PING_COMMAND.REPLY.replace("{ping}", Math.floor(interaction.client.ws.ping)));
  },
};
