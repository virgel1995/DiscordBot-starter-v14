const mongoose = require("mongoose");
const { CACHE_SIZE, PREFIX, STATS } = require("@root/config.js");
const FixedSizeMap = require("fixedsize-map");
const { getUser } = require("./User");

const cache = new FixedSizeMap(CACHE_SIZE.GUILDS);

const Schema = new mongoose.Schema({
  _id: String,
  data: {
    name: String,
    region: String,
    
    owner: { type: String, ref: "users" },
    joinedAt: Date,
    leftAt: Date,
    bots: { type: Number, default: 0 },
  },
  prefix: { type: String, default: PREFIX },

});

const Model = mongoose.model("guild", Schema);

module.exports = {
  /**
   * @param {import('discord.js').Guild} guild
   */
  getSettings: async (guild) => {
    if (!guild) throw new Error("Guild is undefined");
    if (!guild.id) throw new Error("Guild Id is undefined");

    const cached = cache.get(guild.id);
    if (cached) return cached;

    let guildData = await Model.findById(guild.id);
    if (!guildData) {
      // save owner details
      guild
        .fetchOwner()
        .then(async (owner) => {
          const userDb = await getUser(owner);
          await userDb.save();
        })
        .catch((ex) => {});

      // create a new guild model
      guildData = new Model({
        _id: guild.id,
        data: {
          name: guild.name,
          region: guild.preferredLocale,
          owner: guild.ownerId,
          joinedAt: guild.joinedAt,
        },
      });

      await guildData.save();
    }
    cache.add(guild.id, guildData);
    return guildData;
  },
};
