
module.exports = {
  name: "",
  description: "",
  cooldown: 0,
  isPremium: false,
  category: "NONE",
  botPermissions: [],
  userPermissions: [],
  validations: [],
  command: {
    enabled: true,
    aliases: [],
    usage: "",
    minArgsCount: 0,
    subcommands: [],
  },
  slashCommand: {
    enabled: true,
    ephemeral: false,
    options: [],
  },
  messageRun: (message, args, data) => {},
  interactionRun: (interaction, data) => {},
};
