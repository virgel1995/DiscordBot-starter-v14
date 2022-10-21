const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { getUser } = require("@schemas/User");
const { EMBED_COLORS, ECONOMY } = require("@root/config.js");
const { getRandomInt } = require("@helpers/Utils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "gamble",
  description: "try your luck by gambling",
  category: "ECONOMY",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    usage: "<amount>",
    minArgsCount: 1,
    aliases: ["slot"],
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "coins",
        description: "number of coins to bet",
        required: true,
        type: ApplicationCommandOptionType.Integer,
      },
    ],
  },

  async messageRun(message, args, data) {
   let l = data.lang.COMMANDS.ECONOMY.GAMBLE
    const betAmount = parseInt(args[0]);
    if (isNaN(betAmount)) return message.safeReply(l.ERR);
    const response = await gamble(message.author, betAmount, data.lang);
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const betAmount = interaction.options.getInteger("coins");
    const response = await gamble(interaction.user, betAmount, data.lang);
    await interaction.followUp(response);
  },
};

function getEmoji() {
  const ran = getRandomInt(9);
  switch (ran) {
    case 1:
      return "\uD83C\uDF52";
    case 2:
      return "\uD83C\uDF4C";
    case 3:
      return "\uD83C\uDF51";
    case 4:
      return "\uD83C\uDF45";
    case 5:
      return "\uD83C\uDF49";
    case 6:
      return "\uD83C\uDF47";
    case 7:
      return "\uD83C\uDF53";
    case 8:
      return "\uD83C\uDF50";
    case 9:
      return "\uD83C\uDF4D";
    default:
      return "\uD83C\uDF52";
  }
}

function calculateReward(amount, var1, var2, var3) {
  if (var1 === var2 && var2.equals === var3) return 3 * amount;
  if (var1 === var2 || var2 === var3 || var1 === var3) return 2 * amount;
  return 0;
}

async function gamble(user, betAmount, lang) {
    

   let l = lang.COMMANDS.ECONOMY.GAMBLE
  if (isNaN(betAmount)) return l.ERR2;
  if (betAmount < 0) return l.ERR3 ;
  if (betAmount < 10) return l.ERR4;

  const userDb = await getUser(user);
  if (userDb.coins < betAmount)
    return `${l.ERR5} ${userDb.coins || 0}${ECONOMY.CURRENCY}`;

  const slot1 = getEmoji();
  const slot2 = getEmoji();
  const slot3 = getEmoji();

  const str = `
    **${l.AMM}:** ${betAmount}${ECONOMY.CURRENCY}
    **${l.MULT}:** 2x
    ╔══════════╗
    ║ ${getEmoji()} ║ ${getEmoji()} ║ ${getEmoji()} ‎‎‎‎║
    ╠══════════╣
    ║ ${slot1} ║ ${slot2} ║ ${slot3} ⟸
    ╠══════════╣
    ║ ${getEmoji()} ║ ${getEmoji()} ║ ${getEmoji()} ║
    ╚══════════╝
    `;

  const reward = calculateReward(betAmount, slot1, slot2, slot3);
  const result = (reward > 0 ? `${l.WON}: ${reward}` : `${l.LOSE}: ${betAmount}`) + ECONOMY.CURRENCY;
  const balance = reward - betAmount;

  userDb.coins += balance;
  await userDb.save();

  const embed = new EmbedBuilder()
    .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
    .setColor(EMBED_COLORS.TRANSPARENT)
    .setThumbnail("https://i.pinimg.com/originals/9a/f1/4e/9af14e0ae92487516894faa9ea2c35dd.gif")
    .setDescription(str)
    .setFooter({ text: `${result}\n${l.DONE}: ${userDb?.coins}${ECONOMY.CURRENCY}` });

  return { embeds: [embed] };
}
