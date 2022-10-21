const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");

// This dummy token will be replaced by the actual token
const DUMMY_TOKEN = "MY_TOKEN_IS_SECRET";

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "listemoji",
  description: "get all server emojies",
  category: "OWNER",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    usage: "<emojies>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
  
  },

  async messageRun(message, args) {

    let response = await listEmojie(message);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {

    let response = await listEmojie(interaction);
    await interaction.followUp(response);
  },
};

const listEmojie = (message) => {
    
const charactersPerMessage = 2000;
  const emojis =message.guild.emojis.cache .map((e) => `${e} **-** \`"\"${e}\``).join('\n');
    
  const numberOfMessages = Math.ceil(emojis.length / charactersPerMessage);

    
    
  const embed = new EmbedBuilder();
embed.setAuthor({ name: "📤 Emojies" })
for (i = 0; i < numberOfMessages; i++){
   let emo = emojis.slice(i * charactersPerMessage, (i + 1) * charactersPerMessage)
   embed.setDescription(emo)
  }
    embed.setColor(EMBED_COLORS.ERROR)
    embed.setTimestamp(Date.now());

  return { embeds: [embed] };
};
