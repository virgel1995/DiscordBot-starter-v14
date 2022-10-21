const SnakeGame = require("snakecord");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "snake",
  description: "play snake game on discord",
  cooldown: 300,
  category: "FUN",
  botPermissions: ["SendMessages", "EmbedLinks", "AddReactions", "ReadMessageHistory", "ManageMessages"],
  command: {
    enabled: true,
  },
  slashCommand: {
    enabled: true,
  },

  async messageRun(message, args, data) {
    await message.safeReply(data.lang.COMMANDS.FUN.SNAKE.START);
    await startSnakeGame(message, data.lang);
  },

  async interactionRun(interaction, data) {
    await interaction.followUp(data.lang.COMMANDS.FUN.SNAKE.START);
    await startSnakeGame(interaction, data.lang);
  },
};

async function startSnakeGame(data, lang) {
  const snakeGame = new SnakeGame({
    title: lang.COMMANDS.FUN.SNAKE.TITLE,
    color: "BLUE",
    timestamp: true,
    gameOverTitle: lang.COMMANDS.FUN.SNAKE.OVER,
  });

  await snakeGame.newGame(data);
}
