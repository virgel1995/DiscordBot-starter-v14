const { moveTarget } = require("@helpers/ModUtils");

module.exports = async ({ member }, target, reason, channel,lang) => {
    let l = lang.COMMANDS.MODERATION.SHARED.MOVE
  const response = await moveTarget(member, target, reason, channel);
  if (typeof response === "boolean") {
    return `${target.user.tag} ` + l.ERR;
  }
  if (response === "MEMBER_PERM") {
    return l.PERMS + ` ${target.user.tag}`;
  }
  if (response === "BOT_PERM") {
    return l.PERMS2 + ` ${target.user.tag}`;
  }
  if (response === "NO_VOICE") {
    return `${target.user.tag} ` + l.ERR3;
  }
  if (response === "TARGET_PERM") {
    return `${target.user.tag} ${l.ERR4} ${channel}`;
  }
  if (response === "ALREADY_IN_CHANNEL") {
    return `${target.user.tag} ${l.ERR5} ${channel}`;
  }
  return l.ERR3 ` ${target.user.tag} => ${channel}`;
};
