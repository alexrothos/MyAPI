/**
 * Middleware function for token verification. Used in every endpoint for
 * authentication, except login.
 */

const jwt = require('jsonwebtoken')
const secretKey = 'TheseArentTheDroidYouAreLookingFor'

const log4js = require('log4js')
log4js.configure('./conf/log4js.json')
const logger = log4js.getLogger()
const logRec = log4js.getLogger('record')

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')
        jwt.verify(token, secretKey, (err) => {
            if (err) {
                logger.error('Token verification error: ' + err)
                res.status(401).send('Token verification error: ' + err)
            } else {
                next()
            }
        })
    } catch (err) {
        logger.error('Authentication process error: ' + err)
        res.status(401).send('Authentication process error: ' + err)
    }
}

module.exports = auth