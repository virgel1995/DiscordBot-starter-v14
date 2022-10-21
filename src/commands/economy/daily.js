const { EmbedBuilder } = require("discord.js");
const { getUser } = require("@schemas/User");
const { EMBED_COLORS, ECONOMY } = require("@root/config.js");
const { diffHours, getRemainingTime } = require("@helpers/Utils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "daily",
  description: "receive a daily bonus",
  category: "ECONOMY",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
  },
  slashCommand: {
    enabled: true,
  },

  async messageRun(message, args, data) {
    const response = await daily(message.author, data.lang);
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const response = await daily(interaction.user, data.lang);
    await interaction.followUp(response);
  },
};

async function daily(user, lang) {
    

  const l = lang.COMMANDS.ECONOMY.DAILY
  const userDb = await getUser(user);
  let streak = 0;

  if (userDb.daily.timestamp) {
    const lastUpdated = new Date(userDb.daily.timestamp);
    const difference = diffHours(new Date(), lastUpdated);
    if (difference < 24) {
      const nextUsage = lastUpdated.setHours(lastUpdated.getHours() + 24);
      return `${l.ERR}\`${getRemainingTime(nextUsage)}\``;
    }
    streak = userDb.daily.streak || streak;
    if (difference < 48) streak += 1;
    else streak = 0;
  }

  userDb.daily.streak = streak;
  userDb.coins += ECONOMY.DAILY_COINS;
  userDb.daily.timestamp = new Date();
  await userDb.save();

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
    .setDescription(
      `${l.DONE} => ${ECONOMY.DAILY_COINS}${ECONOMY.CURRENCY} <=\n` +
        `** ${l.DONE2}:** ${userDb.coins}${ECONOMY.CURRENCY}`
    );

  return { embeds: [embed] };
}
