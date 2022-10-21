const { ApplicationCommandOptionType, parseEmoji } = require("discord.js");
const {parse} = require('twemoji-parser');
/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "addemojie",
  description: "add emojie from another server or with image url",
  category: "ADMIN",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    usage: "<emojie>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    ephemeral: false,
    options: [
      {
        name: "emojie",
        description: "your emojie or image url",
        type: ApplicationCommandOptionType.String,
        required: false,
      },
      {
        name: "attachment",
        description: "upload imojie from your files ",
        type: ApplicationCommandOptionType.Attachment,
        required: false,
      },
      {
        name: "name",
        description: "emoji name ",
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],
  },

  async messageRun(message, args, data) {
    const emoji = args[0];
     const name = args[1]
    const response = await addEmojie(message, emoji, name);
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    let emoji ; 
   if (interaction.options.getString("emojie")){
      emoji = interaction.options.getString("emojie")
   }else if(interaction.options.getAttachment("attachment")){
 let attachment = interaction.options.getAttachment("attachment")
     emoji = attachment.url
   }
 const name = interaction.options.getString("name")
    const response = await addEmojie(interaction,emoji, name);
    await interaction.followUp(response);
  },
};

async function addEmojie({ guild }, emoji, name) {
  const urlRegex = new RegExp(/^(ftp|http|https):\/\/[^ "]+$/);

if (!emoji) 
return 'Please provide a valid emoji.';

   let ename;
  let customemoji = parseEmoji(emoji); //Check if it's a emoji

    //If it's a custom emoji
    if (customemoji.id) {
        const Link = `https://cdn.discordapp.com/emojis/${customemoji.id}.${
            customemoji.animated ? 'gif' : 'png'
        }`;
     ename = name || customemoji.name;
  const emoji = await guild.emojis.create({ attachment: Link, name: `${ename}` });
   return `Successfuly Created ${emoji} With Name ${ename}`
    }else if (urlRegex.test(emoji)) { //Check if it's a link
        //check for image urls
        ename = name || Math.random().toString(36).slice(2); //make the name compatible or just choose a random string
        try {
            const addedEmoji = await guild.emojis.create({ attachment: emoji, name: `${ename || `${customemoji.name}`}` });

return  `${addedEmoji} added with name "${addedEmoji.name}"`;
        }
        catch (e) {
 return ` Failed to add emoji\n\`\`\`${e.message}\`\`\``

        }
    }
    else {
   let CheckEmoji = parse(emoji, {assetType: 'png'});
        if (!CheckEmoji[0])
  return `Please mention a valid emoji. ${emoji} is invalid`
    }
}
