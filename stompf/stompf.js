const config = require('../conf/config.json')

/**
 * Configuration of ActiveMQ handler
 */
const Stomp = require('stomp-client')
const stompClient = new Stomp(config.ip, config.port, '', '', '', '', {
    retries: 10,
    delay: 2000,
})

module.exports = stompClient