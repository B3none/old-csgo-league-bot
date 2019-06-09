const axios = require('axios');
const config = require('../../app/config');

module.exports = {
  get: () => {
    return axios.create({
      baseURL: config.url,
      headers: {
        'authentication': config.api_key
      }
    });
  }
};