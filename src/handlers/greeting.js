const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const { getSettings } = require("@schemas/Guild");
const virus = require("discord-virus24")
/**
 * @param {string} content
 * @param {import('discord.js').GuildMember} member
 * @param {Object} inviterData
 */
const parse = async (content, member, inviterData = {}) => {
  const inviteData = {};

  const getEffectiveInvites = (inviteData = {}) =>
    inviteData.tracked + inviteData.added - inviteData.fake - inviteData.left || 0;

  if (content.includes("{inviter:")) {
    const inviterId = inviterData.member_id || "NA";
    if (inviterId !== "VANITY" && inviterId !== "NA") {
      try {
        const inviter = await member.client.users.fetch(inviterId);
inviteData.name = inviter.username;
  inviteData.tag = inviter.tag;
  inviteData.id = inviter.id;
      } catch (ex) {
        member.client.logger.error(`Parsing inviterId: ${inviterId}`, ex);
        inviteData.name = "NA";
        inviteData.tag = "NA";       inviteData.id = "NA";
      }
    } else if (member.user.bot) {
      inviteData.name = "OAuth";
      inviteData.tag = "OAuth";
      inviteData.id = "OAuth";
    } else {
      inviteData.name = inviterId;
      inviteData.tag = inviterId;
      inviteData.id = inviterId;
    }
  }
  return content
    .replaceAll(/\\n/g, "\n")
    .replaceAll(/{server}/g, member.guild.name)
      .replaceAll(/{server:icon}/g, member.guild.iconURL({extension: 'jpg'}))
    .replaceAll(/{count}/g, member.guild.memberCount)
    .replaceAll(/{member:nick}/g, member.displayName)
    .replaceAll(/{member:name}/g, member.user.username)
    

    .replaceAll(/{member:id}/g, member.user.id)
    .replaceAll(/{member:dis}/g, member.user.discriminator)
    .replaceAll(/{member:tag}/g, member.user.tag)
    .replaceAll(/{member:avatar}/g, member.displayAvatarURL({extension: 'jpg'}))
    .replaceAll(/{inviter:name}/g, inviteData.name)
    .replaceAll(/{inviter:tag}/g, inviteData.tag)
      .replaceAll(/{inviter:id}/g, inviteData.id)
    .replaceAll(/{invites}/g, getEffectiveInvites(inviterData.invite_data));
};

/**
 * @param {import('discord.js').GuildMember} member
 * @param {"WELCOME"|"FAREWELL"} type
 * @param {Object} config
 * @param {Object} inviterData
 */
const buildGreeting = async (member, type, config, inviterData) => {
  if (!config) return;
  let content;

  // build content
  if (config.content) content = await parse(config.content, member, inviterData);

  // build embed
  const embed = new EmbedBuilder();
  if (config.embed.description) {

    const parsed = await parse(config.embed.description, member, inviterData);

    embed.setDescription(parsed);

  }
  if (config.embed.color) embed.setColor(config.embed.color);
  if (config.embed.thumbnail) embed.setThumbnail(member.user.displayAvatarURL());
  if (config.embed.footer) {
    const parsed = await parse(config.embed.footer, member, inviterData);
    embed.setFooter({ text: parsed });
  }
  if (config.embed.image) {
    const parsed = await parse(config.embed.image, member);
    embed.setImage(parsed);
  }

  // set default message
  if (!config.content && !config.embed.description && !config.embed.footer) {
    content =
      type === "WELCOME"
        ? `Welcome <@{member:id}> To {server} 
 please see **__Rules__** =>  <#901734036609859645> 
You are now the {count}the Member
You have been invited By =><@{inviter:id} >
{inviter:tag} have now => {invites} invite`
        : `{member:tag} has left the server 👋 /n We have now {count} Members
who have been invited By =><@{inviter:id} >
{inviter:tag} have now => {invites} invite
`;
    return { content };
  }
    
  return { content, embeds: [embed] };
 
/*
  let onlineUsers = member.guild.members.cache.filter(member => member.presence === "online").size,

offlineUsers = member.guild.members.cache.filter(member => member.presence  ===  "offline").size,

  Bots = member.guild.members.cache.filter(member => member.user.bot).size

      
let welcImage = await new virus.WelcomeCard()
welcImage.setAddon("background-image", false)
welcImage.setAvatar(member.displayAvatarURL({extension: 'jpg'})) 
welcImage.setUsername(member.user.tag)
welcImage.setStatues(member.presence) 
welcImage.setGuildName(member.guild.name)
welcImage.setGuildIcon(member.guild.iconURL({extension: 'jpg'}))
  welcImage.setMembers(allMembers)
  welcImage.setOnline(onlineUsers)
  welcImage.setOffline(offlineUsers)
  welcImage.setBots(Bots)
   if (config.embed.description) {
    const parsed = await parse(config.embed.description, member, inviterData);
let ctt =  "welcome to my guild"

  welcImage.setText("welcome", ctt)
  }
 if (config.embed.image) {

    const parsed = await parse(config.embed.image, member);

welcImage.setBackground(parsed)
  }
welcImage.toAttachment().toBuffer();

const attachment = new AttachmentBuilder(welcImage, { name: 'profile.png' });

  return { content, files: [attachment] };*/
    
    
    
    
};

/**
 * Send welcome message
 * @param {import('discord.js').GuildMember} member
 * @param {Object} inviterData
 */
async function sendWelcome(member, inviterData = {}) {
  const config = (await getSettings(member.guild))?.welcome;
  if (!config || !config.enabled) return;

  // check if channel exists
  const channel = member.guild.channels.cache.get(config.channel);
  if (!channel) return;

  // build welcome message
  const response = await buildGreeting(member, "WELCOME", config, inviterData);

  channel.safeSend(response);
}

/**
 * Send farewell message
 * @param {import('discord.js').GuildMember} member
 * @param {Object} inviterData
 */
async function sendFarewell(member, inviterData = {}) {
  const config = (await getSettings(member.guild))?.farewell;
  if (!config || !config.enabled) return;

  // check if channel exists
  const channel = member.guild.channels.cache.get(config.channel);
  if (!channel) return;

  // build farewell message
  const response = await buildGreeting(member, "FAREWELL", config, inviterData);

  channel.safeSend(response);
}

module.exports = {
  buildGreeting,
  sendWelcome,
  sendFarewell,
};
