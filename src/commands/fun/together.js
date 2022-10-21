const { ApplicationCommandOptionType } = require("discord.js");

const discordTogether = [
  "askaway",
  "awkword",
  "betrayal",
  "bobble",
  "checkers",
  "chess",
  "chessdev",
  "doodlecrew",
  "fishing",
  "land",
  "lettertile",
  "meme",
  "ocho",
  "poker",
  "puttparty",
  "puttpartyqa",
  "sketchheads",
  "sketchyartist",
  "spellcast",
  "wordsnack",
  "youtube",
  "youtubedev",
];

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "together",
  description: "discord together",
  category: "FUN",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    minArgsCount: 1,
    aliases: ["discordtogether", "distogether", "distog"],
    usage: "<game>",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "type",
        description: "type",
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: discordTogether.map((game) => ({ name: game, value: game })),
      },
    ],
  },

  async messageRun(message, args, data) {
    const input = args[0];
    const response = await getTogetherInvite(message.member, input, data.lang);
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const choice = interaction.options.getString("type");
    const response = await getTogetherInvite(interaction.member, choice, data.lang);
    await interaction.followUp(response);
  },
};

async function getTogetherInvite(member, choice, lang) {
    let l = lang.COMMANDS.FUN.TOGETHER
  choice = choice.toLowerCase();

  const vc = member.voice.channel?.id;
  if (!vc) return l.ERR;

  if (!discordTogether.includes(choice)) {
    return l.ERR2 + ":" + discordTogether.join(", ");
  }

  const invite = await member.client.discordTogether.createTogetherCode(vc, choice);
  return `${invite.code}`;
}
