const { getSettings } = require("@schemas/Guild");
const { getUser } = require("@schemas/User");
const { commandHandler, contextHandler, statsHandler, suggestionHandler, ticketHandler } = require("@src/handlers");
const { InteractionType } = require("discord.js");

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').BaseInteraction} interaction
 */
module.exports = async (client, interaction) => {
    //define User language 
  const userDb = await getUser(interaction.user);

  let language = userDb.lang;
    if (!language) language = "en";
    const lang = require(`@root/lang/bot/${language}`);

  if (!interaction.guild) {
    return interaction
      .reply({ content: lang.EVENTS.MESSAGE_EVENT.DM_REPLY, ephemeral: true })
      .catch(() => {});
  }
//const user = interaction.options.getUser('target');

  // Slash Commands
  if (interaction.isChatInputCommand()) {
      //if (client.config.Maintenance.ENABLED && client.config.OWNER_IDS.includes(interaction.user.id) ) {
  await commandHandler.handleSlashCommand(interaction);
     /* } else {
return interaction.reply({ content: "Sorry But Am Maintance Now \n Just Admins Can Use Interaction's", ephemeral: true })
      }*/
  }

  // Context Menu
  else if (interaction.isContextMenuCommand()) {
    const context = client.contextMenus.get(interaction.commandName);
    if (context) await contextHandler.handleContext(interaction, context);
    else return interaction.reply({ content: "An error has occurred", ephemeral: true }).catch(() => {});
  }

  // Buttons
  else if (interaction.isButton()) {
    switch (interaction.customId) {
      case "TICKET_CREATE":
        return ticketHandler.handleTicketOpen(interaction);

      case "TICKET_CLOSE":
        return ticketHandler.handleTicketClose(interaction);

      case "SUGGEST_APPROVE":
        return suggestionHandler.handleApproveBtn(interaction);

      case "SUGGEST_REJECT":
        return suggestionHandler.handleRejectBtn(interaction);

      case "SUGGEST_DELETE":
        return suggestionHandler.handleDeleteBtn(interaction);
    }
  }

  // Modals
  else if (interaction.type === InteractionType.ModalSubmit) {
    switch (interaction.customId) {
      case "SUGGEST_APPROVE_MODAL":
        return suggestionHandler.handleApproveModal(interaction);

      case "SUGGEST_REJECT_MODAL":
        return suggestionHandler.handleRejectModal(interaction);

      case "SUGGEST_DELETE_MODAL":
        return suggestionHandler.handleDeleteModal(interaction);
    }
  }

  const settings = await getSettings(interaction.guild);

  // track stats
  if (settings.stats.enabled) statsHandler.trackInteractionStats(interaction).catch(() => {});
};
