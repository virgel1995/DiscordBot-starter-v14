const {
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonStyle,
} = require("discord.js");
const { timeformat } = require("@helpers/Utils");
const { EMBED_COLORS, SUPPORT_SERVER, DASHBOARD } = require("@root/config.js");
const botstats = require("../shared/botstats");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "bot",
  description: "bot related commands",
  category: "INFORMATION",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: false,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "invite",
        description: "get bot's invite",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "stats",
        description: "get bot's statistics",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "uptime",
        description: "get bot's uptime",
        type: ApplicationCommandOptionType.Subcommand,
      },
    ],
  },

  async interactionRun(interaction, data) {
   let l = data.lang.COMMANDS.INFORMATION.SLASH.BOT
    const sub = interaction.options.getSubcommand();
    if (!sub) return interaction.followUp(data.lang.INVALID_SUB);

    // Invite
    if (sub === "invite") {
      const response = botInvite(interaction.client, data.lang);
      try {
        await interaction.user.send(response);
        return interaction.followUp(l.DM);
      } catch (ex) {
        return interaction.followUp(l.ERR);
      }
    }

    // Stats
    else if (sub === "stats") {
      const response = botstats(interaction.client, data.lang);
      return interaction.followUp(response);
    }

    // Uptime
    else if (sub === "uptime") {
      await interaction.followUp(l.UP + `: \`${timeformat(process.uptime())}\``);
    }
  },
};

function botInvite(client, lang) {
    let l = lang.COMMANDS.INFORMATION.SLASH.BOT
  const embed = new EmbedBuilder()
    .setAuthor({ name: l.LINK })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setThumbnail(client.user.displayAvatarURL())
    .setDescription(l.DESC);

  // Buttons
  let components = [];
  components.push(new ButtonBuilder().setLabel(l.LINK).setURL(client.getInvite()).setStyle(ButtonStyle.Link));

  if (SUPPORT_SERVER) {
    components.push(new ButtonBuilder().setLabel(l.SUPPORT).setURL(SUPPORT_SERVER).setStyle(ButtonStyle.Link));
  }

  if (DASHBOARD.enabled) {
    components.push(
      new ButtonBuilder().setLabel(l.WEB).setURL(DASHBOARD.baseURL).setStyle(ButtonStyle.Link)
    );
  }

  let buttonsRow = new ActionRowBuilder().addComponents(components);
  return { embeds: [embed], components: [buttonsRow] };
}
