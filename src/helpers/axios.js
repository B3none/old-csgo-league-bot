const axios = require('axios');
const { url,api_key } = require('../../app/config');

module.exports = {
  get: () => {
    return axios.create({
      baseURL: url,
      headers: {
        'authentication': api_key
      }
    });
  }
};