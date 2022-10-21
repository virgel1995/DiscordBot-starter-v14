const { ApplicationCommandOptionType } = require("discord.js");
const { getUser } = require("@schemas/User");
const { recursiveReadDirSync } = require("@helpers/Utils");
const path = require("path");
var fs = require('fs');   
var _ = require('lodash'); 
var fileNames = []

module.exports = {
  name: "setlang",
  description: "change your owen bot replys language",
  category: "UTILITY",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    usage: "<new-lang>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "lang",
        description: "change your owen bot replys language",
        type: ApplicationCommandOptionType.String,
         required: true,
        choices :[
      { name: 'English', value: 'en' },
			{ name: 'Arabic', value: 'ar' },
			
        ]
			
      },
    ],
  },

  async messageRun(message, args, data) {
     //const userDb = await getUser(message.author);
    const newLang = args[0];
 

    const response = await setNewLang(newLang, data.userDb, data.lang);
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const response = await setNewLang(interaction.options.getString("lang"), data.userDb, data.lang);
    await interaction.followUp(response);
  },
};

async function setNewLang(newLang, userDb, lang) {
  const l = lang.COMMANDS.UTILS.SETLANG
  if (newLang.length > 2) return l.ERR ;
if(fileNames.includes(newLang)){

  userDb.lang = newLang;
  await userDb.save();
  return l.DONE + ` \`${newLang}\``;
}else {
  return l.NOT_SUP + ` : \`${fileNames}\``;
}


}
(async function getLangs() {         
fs.readdir("lang/bot", function(err,list){
    _.forEach(list, function(f){
        fileNames.push(path.basename(f, ".js"));
     });
}); 
})();