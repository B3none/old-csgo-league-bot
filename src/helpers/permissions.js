module.exports = {
  hasPermission: (command, message) => {
    let hasPermission = true;

    if (command.permissions.length) {
      hasPermission = false;

      command.permissions.map(roleId => {
        if (message.member.roles && message.member.roles.has(roleId)) {
          hasPermission = true;
        }
      });
    }

    return hasPermission;
  }
};