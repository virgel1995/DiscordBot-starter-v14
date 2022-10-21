const { unDeafenTarget } = require("@helpers/ModUtils");

module.exports = async ({ member }, target, reason,lang) => {
  let l = lang.COMMANDS.MODERATION.SHARED.UMDEFINE
  const response = await unDeafenTarget(member, target, reason);
  if (typeof response === "boolean") {
    return `${target.user.tag} ` + l.ERR ;
  }
  if (response === "MEMBER_PERM") {
    return l.PERMS + ` ${target.user.tag}`;
  }
  if (response === "BOT_PERM") {
    return l.PERMS2 + ` ${target.user.tag}`;
  }
  if (response === "NO_VOICE") {
    return `${target.user.tag} ` + l.ERR2;
  }
  if (response === "NOT_DEAFENED") {
    return `${target.user.tag} ` + l.ERR4;
  }
  return l.ERR3 + ` ${target.user.tag}`;
};
