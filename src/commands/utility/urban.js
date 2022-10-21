const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { MESSAGES, EMBED_COLORS } = require("@root/config.js");
const { getJson } = require("@helpers/HttpUtils");
const moment = require("moment");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "urban",
  description: "searches the urban dictionary",
  cooldown: 5,
  category: "UTILITY",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    usage: "<word>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "word",
        description: "the word for which you want to urban meaning",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args, data) {
    const word = args.join(" ");
    const response = await urban(word, data.lang);
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const word = interaction.options.getString("word");
    const response = await urban(word, data.lang);
    await interaction.followUp(response);
  },
};

async function urban(word, lang) {
 const l = lang.COMMANDS.UTILS.URBAN
  const response = await getJson(`http://api.urbandictionary.com/v0/define?term=${word}`);
  if (!response.success) return MESSAGES.API_ERROR;

  const json = response.data;
  if (!json.list[0]) return l.NOTHING + ` \`${word}\``;

  const data = json.list[0];
  const embed = new EmbedBuilder()
    .setTitle(data.word)
    .setURL(data.permalink)
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(`**${l.DESC} **\`\`\`css\n${data.definition}\`\`\``)
    .addFields(
      {
        name: l.F1,
        value: data.author,
        inline: true,
      },
      {
        name: l.F2,
        value: data.defid.toString(),
        inline: true,
      },
      {
        name: l.F3,
        value: `👍 ${data.thumbs_up} | 👎 ${data.thumbs_down}`,
        inline: true,
      },
      {
        name: l.F4,
        value: data.example,
        inline: false,
      }
    )
    .setFooter({ text: l.F5 + ` ${moment(data.written_on).fromNow()}` });

  return { embeds: [embed] };
}
