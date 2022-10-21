const { parseEmoji, EmbedBuilder } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");

module.exports = (emoji,lang) => {
       let l = lang.COMMANDS.INFORMATION.SHARED.EMOJIINFO
  let custom = parseEmoji(emoji);
  if (!custom.id) return l.ERR;

  let url = `https://cdn.discordapp.com/emojis/${custom.id}.${custom.animated ? "gif?v=1" : "png"}`;

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor({ name: l.TITLE })
    .setDescription(
      `**${l.ID}:** ${custom.id}\n` + `**${l.NAME}:** ${custom.name}\n` + `**${l.ANIM}:** ${custom.animated ? "✅" : "❌"}`
    )
    .setImage(url);

  return { embeds: [embed] };
};
