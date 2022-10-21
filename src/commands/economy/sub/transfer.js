const { EmbedBuilder } = require("discord.js");
const { getUser } = require("@schemas/User");
const { ECONOMY, EMBED_COLORS } = require("@root/config");

module.exports = async (self, target, coins, lang) => {
    let l = lang.COMMANDS.ECONOMY.SUB.TRANSFER
  if (isNaN(coins) || coins <= 0) return l.ERR;
  if (target.bot) return l.ERR2 ;
  if (target.id === self.id) return l.ERR3;

  const userDb = await getUser(self);

  if (userDb.bank < coins) {
    return l.ERR4 + ` ${userDb.bank}${ECONOMY.CURRENCY} ${l.ERR5}${
      userDb.coins > 0 && l.ERR6
    } `;
  }

  const targetDb = await getUser(target);

  userDb.bank -= coins;
  targetDb.bank += coins;

  await userDb.save();
  await targetDb.save();

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor({ name: l.UPDATED })
    .setDescription(`${l.DONE}${coins}${ECONOMY.CURRENCY} ${l.TO} ${target.tag}`)
    .setTimestamp(Date.now());

  return { embeds: [embed] };
};
