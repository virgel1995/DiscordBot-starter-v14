const { EmbedBuilder } = require("discord.js");
const { getUser } = require("@schemas/User");
const { ECONOMY, EMBED_COLORS } = require("@root/config");

module.exports = async (user, coins, lang) => {
  const l = lang.COMMANDS.ECONOMY.SUB.DEP
  if (isNaN(coins) || coins <= 0) return l.ERR;
  const userDb = await getUser(user);

  if (coins > userDb.coins) return `${l.ERR2} ${userDb.coins}${ECONOMY.CURRENCY} ${l.ERR3}`;

  userDb.coins -= coins;
  userDb.bank += coins;
  await userDb.save();

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor({ name: l.NEW })
    .setThumbnail(user.displayAvatarURL())
    .addFields(
      {
        name: l.WALLET,
        value: `${userDb.coins}${ECONOMY.CURRENCY}`,
        inline: true,
      },
      {
        name: l.BANK,
        value: `${userDb.bank}${ECONOMY.CURRENCY}`,
        inline: true,
      },
      {
        name: l.NET,
        value: `${userDb.coins + userDb.bank}${ECONOMY.CURRENCY}`,
        inline: true,
      }
    );

  return { embeds: [embed] };
};
