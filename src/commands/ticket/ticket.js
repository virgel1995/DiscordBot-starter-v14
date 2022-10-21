const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ModalBuilder,
  TextInputBuilder,
  ApplicationCommandOptionType,
  ChannelType,
  ButtonStyle,
  TextInputStyle,
  ComponentType,
} = require("discord.js");
const { EMBED_COLORS } = require("@root/config.js");
const { isTicketChannel, closeTicket, closeAllTickets } = require("@handlers/ticket");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "ticket",
  description: "various ticketing commands",
  category: "TICKET",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    minArgsCount: 1,
    subcommands: [
      {
        trigger: "setup <#channel>",
        description: "start an interactive ticket setup",
      },
      {
        trigger: "log <#channel>",
        description: "setup log channel for tickets",
      },
    /*  {
        trigger: "limit <number>",
        description: "set maximum number of concurrent open tickets",
      },*/
      {
        trigger: "close",
        description: "close the ticket",
      },
      {
        trigger: "closeall",
        description: "close all open tickets",
      },
      {
        trigger: "add <userId|roleId>",
        description: "add user/role to the ticket",
      },
      {
        trigger: "remove <userId|roleId>",
        description: "remove user/role from the ticket",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "setup",
        description: "setup a new ticket message",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "the channel where ticket creation message must be sent",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
        ],
      },
      {
        name: "log",
        description: "setup log channel for tickets",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "channel where ticket logs must be sent",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
        ],
      },
     /* {
        name: "limit",
        description: "set maximum number of concurrent open tickets",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "amount",
            description: "max number of tickets",
            type: ApplicationCommandOptionType.Integer,
            required: true,
          },
        ],
      },*/
      {
        name: "close",
        description: "closes the ticket [used in ticket channel only]",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "closeall",
        description: "closes all open tickets",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "add",
        description: "add user to the current ticket channel [used in ticket channel only]",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user_id",
            description: "the id of the user to add",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "remove",
        description: "remove user from the ticket channel [used in ticket channel only]",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user",
            description: "the user to remove",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args, data) {
  const l = data.lang.COMMANDS.TICKET.TICKET
    const input = args[0].toLowerCase();
    let response;

    // Setup
    if (input === "setup") {
      if (!message.guild.members.me.permissions.has("ManageChannels")) {
        return message.safeReply(l.PERMS);
      }
      const targetChannel = message.guild.findMatchingChannels(args[1])[0];
      if (!targetChannel) {
        return message.safeReply(l.NO_CH);
      }
      return ticketModalSetup(message, targetChannel, data.settings, data.lang);
    }

    // log ticket
    else if (input === "log") {
      if (args.length < 2) return message.safeReply(l.ERR);
      const target = message.guild.findMatchingChannels(args[1]);
      if (target.length === 0) return message.safeReply(l.NO_CH);
      response = await setupLogChannel(target[0], data.settings, data.lang);
    }

    // Set limit
  /*  else if (input === "limit") {
      if (args.length < 2) return message.safeReply("Please provide a number");
      const limit = args[1];
      if (isNaN(limit)) return message.safeReply("Please provide a number input");
      response = await setupLimit(message, limit, data.settings, data.lang);
    }*/

    // Close ticket
    else if (input === "close") {
      response = await close(message, message.author, data.lang);
      if (!response) return;
    }

    // Close all tickets
    else if (input === "closeall") {
      let sent = await message.safeReply(l.CLOSING);
      response = await closeAll(message, message.author, data.lang);
      return sent.editable ? sent.edit(response) : message.channel.send(response);
    }

    // Add user to ticket
    else if (input === "add") {
      if (args.length < 2) return message.safeReply(l.ERR1);
      let inputId;
      if (message.mentions.users.size > 0) inputId = message.mentions.users.first().id;
      else if (message.mentions.roles.size > 0) inputId = message.mentions.roles.first().id;
      else inputId = args[1];
      response = await addToTicket(message, inputId, data.lang);
    }

    // Remove user from ticket
    else if (input === "remove") {
      if (args.length < 2) return message.safeReply(l.ERR2);
      let inputId;
      if (message.mentions.users.size > 0) inputId = message.mentions.users.first().id;
      else if (message.mentions.roles.size > 0) inputId = message.mentions.roles.first().id;
      else inputId = args[1];
      response = await removeFromTicket(message, inputId, data.lang);
    }

    // Invalid input
    else {
      return message.safeReply(data.lang.INVALID_USAGE);
    }

    if (response) await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
  const l = data.lang.COMMANDS.TICKET.TICKET
    const sub = interaction.options.getSubcommand();
    let response;

    // setup
    if (sub === "setup") {
      const channel = interaction.options.getChannel("channel");

      if (!interaction.guild.members.me.permissions.has("ManageChannels")) {
        return interaction.followUp(l.PERMS);
      }

      await interaction.deleteReply();
      return ticketModalSetup(interaction, channel, data.settings, data.lang);
    }

    // Log channel
    else if (sub === "log") {
      const channel = interaction.options.getChannel("channel");
      response = await setupLogChannel(channel, data.settings, data.lang);
    }

    // Limit
   /* else if (sub === "limit") {
      const limit = interaction.options.getInteger("amount");
      response = await setupLimit(interaction, limit, data.settings, data.lang);
    }*/

    // Close
    else if (sub === "close") {
      response = await close(interaction, interaction.user, data.lang);
    }

    // Close all
    else if (sub === "closeall") {
      response = await closeAll(interaction, interaction.user, data.lang);
    }

    // Add to ticket
    else if (sub === "add") {
      const inputId = interaction.options.getString("user_id");
      response = await addToTicket(interaction, inputId, data.lang);
    }

    // Remove from ticket
    else if (sub === "remove") {
      const user = interaction.options.getUser("user");
      response = await removeFromTicket(interaction, user.id, data.lang);
    }

    if (response) await interaction.followUp(response);
  },
};

/**
 * @param {import('discord.js').Message} param0
 * @param {import('discord.js').GuildTextBasedChannel} targetChannel
 * @param {object} settings
 */
async function ticketModalSetup({ guild, channel, member }, targetChannel, settings, lang) {

  const l = lang.COMMANDS.TICKET.TICKET
  const buttonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("ticket_btnSetup").setLabel(l.BTN).setStyle(ButtonStyle.Primary)
  );

  const sentMsg = await channel.safeSend({
    content: l.CTX,
    components: [buttonRow],
  });

  if (!sentMsg) return;

  const btnInteraction = await channel
    .awaitMessageComponent({
      componentType: ComponentType.Button,
      filter: (i) => i.customId === "ticket_btnSetup" && i.member.id === member.id && i.message.id === sentMsg.id,
      time: 20000,
    })
    .catch((ex) => {});

  if (!btnInteraction) return sentMsg.edit({ content: l.CTX1, components: [] });

  // display modal
  await btnInteraction.showModal(
    new ModalBuilder({
      customId: "ticket-modalSetup",
      title: l.TITLE ,
      components: [
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("title")
            .setLabel(l.BTN1)
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("description")
            .setLabel(l.BTN2)
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("footer")
            .setLabel(l.BTN3)
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("staff")
            .setLabel(l.BTN4)
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
        ),
      ],
    })
  );

  // receive modal input
  const modal = await btnInteraction
    .awaitModalSubmit({
      time: 1 * 60 * 1000,
      filter: (m) => m.customId === "ticket-modalSetup" && m.member.id === member.id && m.message.id === sentMsg.id,
    })
    .catch((ex) => {});

  if (!modal) return sentMsg.edit({ content: l.CANCEL, components: [] });

  await modal.reply(l.ONGOING);
  const title = modal.fields.getTextInputValue("title");
  const description = modal.fields.getTextInputValue("description");
  const footer = modal.fields.getTextInputValue("footer");
  const staffRoles = modal.fields
    .getTextInputValue("staff")
    .split(",")
    .filter((s) => guild.roles.cache.has(s.trim()));

  // send ticket message
  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor({ name: title || l.AUTHOR })
    .setDescription(description || l.DESC)
    .setFooter({ text: footer || l.FOOTER });

  const tktBtnRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setLabel(l.BTN5).setCustomId("TICKET_CREATE").setStyle(ButtonStyle.Success)
  );

  // save configuration
  settings.ticket.staff_roles = staffRoles;
  await settings.save();

  await targetChannel.send({ embeds: [embed], components: [tktBtnRow] });
  await modal.deleteReply();
  await sentMsg.edit({ content: l.SUCCESS, components: [] });
}

async function setupLogChannel(target, settings, lang) {
  

  const l = lang.COMMANDS.TICKET.TICKET
  if (!target.canSendEmbeds()) return l.LOG_PERMS + ` ${target}`;

  settings.ticket.log_channel = target.id;
  await settings.save();

  return l.LOG_DONE + ` ${target.toString()}`;
}

async function setupLimit(limit, settings, lang) {

  const l = lang.COMMANDS.TICKET.TICKET
  //  if (Number.parseInt(limit,10 ) < 5) return "Ticket limit cannot be less than 5";

  settings.ticket.limit = Number (limit);
  await settings.save();

  return l.LIMIT + ` \`${limit}\` ` + l.LIMIT1;
}

async function close({ channel }, author, lang) {

  const l = lang.COMMANDS.TICKET.TICKET
  if (!isTicketChannel(channel)) return l.CLOSE_ERR;
  const status = await closeTicket(channel, author, l.CLOSE_REASON);
  if (status === "MISSING_PERMISSIONS") return l.CLOSE_PERMS ;
  if (status === "ERROR") return l.CLOSE_ERR1;
  return null;
}

async function closeAll({ guild }, user, lang) {
    
  const l = lang.COMMANDS.TICKET.TICKET
  const stats = await closeAllTickets(guild, user);
  return l.CLOSE_ALL + `: \`${stats[0]}\` ${l.CLOSE_ALL1}: \`${stats[1]}\``;
}

async function addToTicket({ channel }, inputId, lang) {
 
  const l = lang.COMMANDS.TICKET.TICKET
  if (!isTicketChannel(channel)) return l.CLOSE_ERR;
  if (!inputId || isNaN(inputId)) return l.ADD_ERR ;

  try {
    await channel.permissionOverwrites.create(inputId, {
      ViewChannel: true,
      SendMessages: true,
    });

    return l.ADD_DONE;
  } catch (ex) {
    return l.ADD_FAIL;
  }
}

async function removeFromTicket({ channel }, inputId, lang) {

  const l = lang.COMMANDS.TICKET.TICKET
  if (!isTicketChannel(channel)) return l.CLOSE_ERR;
  if (!inputId || isNaN(inputId)) return l.ADD_ERR;

  try {
    channel.permissionOverwrites.create(inputId, {
      ViewChannel: false,
      SendMessages: false,
    });
    return l.ADD_DONE;
  } catch (ex) {
    return l.REMOVE_FAIL;
  }
}
