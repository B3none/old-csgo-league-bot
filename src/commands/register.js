const path = require('path');

module.exports = {
  aliases: [path.basename(__filename).split('.')[0], 'login'],
  permissions: [],
  disabled: false,
  description: 'Allows a user to link their steam account with discord.',
  command: (client, message) => {

  }
};
