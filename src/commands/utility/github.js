const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { MESSAGES } = require("@root/config.js");
const { getJson } = require("@helpers/HttpUtils");
const { stripIndent } = require("common-tags");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "github",
  description: "shows github statistics of a user",
  cooldown: 10,
  category: "UTILITY",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    aliases: ["git"],
    usage: "<username>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "username",
        description: "github username",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args, data) {
    const username = args.join(" ");
    const response = await getGithubUser(username, message.author, data.lang);
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const username = interaction.options.getString("username");
    const response = await getGithubUser(username, interaction.user, data.lang);
    await interaction.followUp(response);
  },
};

const websiteProvided = (text) => (text.startsWith("http://") ? true : text.startsWith("https://"));

async function getGithubUser(target, author, lang) {
const l = lang.COMMANDS.UTILS.GITHUB
  const response = await getJson(`https://api.github.com/users/${target}`);
  if (response.status === 404) return l.NO_USER ;
  if (!response.success) return MESSAGES.API_ERROR;

  const json = response.data;
  const {
    login: username,
    name,
    id: githubId,
    avatar_url: avatarUrl,
    html_url: userPageLink,
    followers,
    following,
    bio,
    location,
    blog,
  } = json;

  let website = websiteProvided(blog) ? `[${l.CLICK}](${blog})` : l.NOT_PROV;
  if (website == null) website = l.NOT_PROV;

  const embed = new EmbedBuilder()
    .setAuthor({
      name: l.AUTHOR + `: ${username}`,
      url: userPageLink,
      iconURL: avatarUrl,
    })
    .addFields(
      {
        name: l.F1,
        value: stripIndent`
        **${l.F1_NAME}**: *${name || l.NOT_PROV}*
        **${l.F1_LOCATION}**: *${location}*
        **${l.F1_GIT_ID}**: *${githubId}*
        **${l.F1_WEBSITE}**: *${website}*\n`,
        inline: true,
      },
      {
        name: l.F2,
        value: `**${l.F2_FOLLOWERS}**: *${followers}*\n**${l.F2_FOLLOWING}**: *${following}*`,
        inline: true,
      }
    )
    .setDescription(`**${l.F2_BIO}**:\n${bio || l.NOT_PROV}`)
    .setImage(avatarUrl)
    .setColor(0x6e5494)
    .setFooter({ text: author.tag });

  return { embeds: [embed] };
}
