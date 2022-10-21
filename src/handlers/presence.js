const { ActivityType } = require("discord.js");

/**
 * @param {import('@src/structures').BotClient} client
 */
function updatePresence(client) {
  let message = client.config.PRESENCE.MESSAGE;
let mess = message[Math.floor(Math.random() * message.length)]
  if (mess.includes("{servers}")) {
    mess = mess.replaceAll("{servers}", client.guilds.cache.size);
  }

  if (mess.includes("{members}")) {
    const members = client.guilds.cache.map((g) => g.memberCount).reduce((partial_sum, a) => partial_sum + a, 0);
    mess = mess.replaceAll("{members}", members);
  }

  const getType = (type) => {
    switch (type) {
      case "COMPETING":
        return ActivityType.Competing;

      case "LISTENING":
        return ActivityType.Listening;

      case "PLAYING":
        return ActivityType.Playing;

      case "WATCHING":
        return ActivityType.Watching;
    }
  };
 let typings = client.config.PRESENCE.TYPE
 let typing = typings[Math.floor(Math.random() * typings.length)]
let statuses = client.config.PRESENCE.STATUS
let stat = statuses[Math.floor(Math.random() * statuses.length)]

  client.user.setPresence({
    status: stat,
    activities: [
      {
        name: mess,
        type: getType(typing),
         URL: "152.70.156.177:25606"
      },
    ],
  });
/*
client.user.setActivity(stat, {

        type: getType(typing),

        URL: "https://www.youtube.com/channel/UCJRFxBrnUSY-xDLBvvWXtOQ"

      });*/
}

module.exports = function handlePresence(client) {
  updatePresence(client);
  setInterval(() => updatePresence(client), 10 * 60 * 1000);
};
//1 * 60 * 1000
