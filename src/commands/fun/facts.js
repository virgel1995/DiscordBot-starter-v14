const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { MESSAGES, EMBED_COLORS } = require("@root/config.js");
const { getJson } = require("@helpers/HttpUtils");

const animals = ["cat", "dog", "panda", "fox", "red_panda", "koala", "bird", "raccoon", "kangaroo"];
const BASE_URL = "https://some-random-api.ml/animal";

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "facts",
  description: "shows a random animal facts",
  cooldown: 5,
  category: "FUN",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    usage: "<animal>",
    aliases: ["fact"],
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "name",
        description: "animal type",
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: animals.map((animal) => ({ name: animal, value: animal })),
      },
    ],
  },

  async messageRun(message, args, data) {
    const choice = args[0];
    if (!animals.includes(choice)) {
      return message.safeReply(data.lang.COMMANDS.FUN.ANIMAL.ERR`:\n${animals.join(", ")}`);
    }
    const response = await getFact(message.author, choice, data.lang);
    return message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const choice = interaction.options.getString("name");
    const response = await getFact(interaction.user, choice, data.lang);
    await interaction.followUp(response);
  },
};

async function getFact(user, choice, lang) {
  const response = await getJson(`${BASE_URL}/${choice}`);
  if (!response.success) return MESSAGES.API_ERROR;

  const fact = response.data?.fact;
  const imageUrl = response.data?.image;
  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.TRANSPARENT)
    .setThumbnail(imageUrl)
    .setDescription(fact)
    .setFooter({ text: user.tag });

  return { embeds: [embed] };
}
