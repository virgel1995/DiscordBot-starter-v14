const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { MESSAGES, EMBED_COLORS } = require("@root/config.js");
const { getJson } = require("@helpers/HttpUtils");
const timestampToDate = require("timestamp-to-date");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "covid",
  description: "get covid statistics for a country",
  cooldown: 5,
  category: "UTILITY",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    usage: "<country>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "country",
        description: "country name to get covid statistics for",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args, data) {
    const country = args.join(" ");
    const response = await getCovid(country, data.lang);
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const country = interaction.options.getString("country");
    const response = await getCovid(country, data.lang);
    await interaction.followUp(response);
  },
};

async function getCovid(country, lang) {
 const l = lang.COMMANDS.UTILS.COVID
  const response = await getJson(`https://disease.sh/v2/countries/${country}`);

  if (response.status === 404) return "```css\n"+ l.ERR +"```";
  if (!response.success) return MESSAGES.API_ERROR;
  const { data } = response;

  const mg = timestampToDate(data?.updated, "dd.MM.yyyy at HH:mm");
  const embed = new EmbedBuilder()
    .setTitle(l.TITLE + ` - ${data?.country}`)
    .setThumbnail(data?.countryInfo.flag)
    .setColor(EMBED_COLORS.BOT_EMBED)
    .addFields(
      {
        name: l.F1 ,
        value: data?.cases.toString(),
        inline: true,
      },
      {
        name: l.F2,
        value: data?.todayCases.toString(),
        inline: true,
      },
      {
        name: l.F3,
        value: data?.deaths.toString(),
        inline: true,
      },
      {
        name: l.F4,
        value: data?.todayDeaths.toString(),
        inline: true,
      },
      {
        name: l.F5 ,
        value: data?.recovered.toString(),
        inline: true,
      },
      {
        name: l.F6,
        value: data?.active.toString(),
        inline: true,
      },
      {
        name: l.F7,
        value: data?.critical.toString(),
        inline: true,
      },
      {
        name: l.F8,
        value: data?.casesPerOneMillion.toString(),
        inline: true,
      },
      {
        name: l.F9,
        value: data?.deathsPerOneMillion.toString(),
        inline: true,
      }
    )
    .setFooter(l.FOOTER + mg );

  return { embeds: [embed] };
}
