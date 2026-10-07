var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  // SOCKET_URL: '"http://192.168.11.150:10016"',
  SOCKET_URL: '"http://localhost:10016"',
  // API_URL: '"http://192.168.11.150:10020"'
  API_URL: '"http://localhost:10020"'
})
