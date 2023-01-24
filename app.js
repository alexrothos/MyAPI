/**
 * BIDS Monitoring API is a server application that establish a connection to a
 * command topic on ActiveMQ and accepts request from users.
 *
 * Through the AMQ connection is able to receive data and send commands to
 * media players through the command topic.
 *
 * The endpoints are serving typical user management requests and status data
 * for media players.
 */

const chalk = require('chalk')
const config = require('./conf/config.json')
const postgres = require('postgres')
const sql = postgres(config.DB.url)

const log4js = require('log4js')
log4js.configure('./conf/log4js.json')
const logger = log4js.getLogger()
const logRec = log4js.getLogger('record')

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const secretKey = 'TheseArentTheDroidYouAreLookingFor'

const stompClient = require('./stompf/stompf')
const msgh = require('./msg_handlers/msg_handlers')
const addMsg = msgh.addMsg
const addPlayer = msgh.addPlayer
const sender = msgh.sender
const auth = require('./auth/auth')

/**
 * Establishing connection with the topic
 * and write incoming data to DB
 */
stompClient.connect(function () {
    stompClient.subscribe(config.notifications_topic, function (body, err) {
        try {
            console.log(JSON.parse(body)) // for testing...
            let data = JSON.parse(body)

            // Function addMsg for writing to DB -> addMsg(temperature,time_of_entry)
            addMsg(data.msg, data.player_id, data.uuid)
            addPlayer(
                data.player_id,
                data.hall,
                data.location,
                data.last_known_player_id,
                data.last_known_ip,
                data.fixed_ip,
                data.group,
                data.msg
            )
        } catch (err) {
            logger.error('Error in writing to DB : ' + err)
        }
    })
    console.log(chalk.green('Consumer connected'))
})

/**
 * The API construction starts here
 * A simple server with only one endpoint
 * for incoming command requests
 */
const express = require('express')
const app = express()

//app.use(express.static('public'))
app.use(express.json())

const cors = require('cors')
app.use(cors())

app.get('/', function (req, res) {
    console.log('NODE SERVER IS RUNNING')
    res.status(200).send('NODE SERVER IS RUNNING')
})

app.get('/command', auth, function (req, res) {
    try {
        sender(req.body)
        res.status(200).send('Command send')
    } catch (err) {
        logger.error('Server error : ' + err)
        res.sendStatus(500)
    }
})

app.post('/command', auth, function (req, res) {
    try {
        sender(req.body)
        res.status(200).send('Command send')
    } catch (err) {
        logger.error('Server error : ' + err)
        res.sendStatus(500)
    }
})

// This endpoint returns the current status of all the media players.
app.post('/media_db', auth, async function (req, res) {
    try {
        let id = req.body.mpId
        let data = []
        if (id === '') {
            data = await sql`SELECT * FROM "BIDS".media_stats`
        } else {
            data =
                await sql`SELECT * FROM "BIDS".media_stats WHERE player_id = ${req.body.mpId}`
        }
        res.status(200).send(JSON.stringify(data))
    } catch (err) {
        logger.error('Database error :  ' + err)
        res.sendStatus(501)
    }
})

// This endpoint returns a table with temperature - color cross reference.
app.get('/colors', auth, async function (req, res) {
    try {
        let data =
            await sql`SELECT color,temperature FROM "BIDS".temp_boundaries`
        res.status(200).send(JSON.stringify(data))
    } catch (err) {
        logger.error('Database error :  ' + err)
        res.sendStatus(501)
    }
})

app.get('/users', auth, async function (req, res) {
    try {
        let data = await sql`SELECT * FROM "BIDS".users`
        res.status(200).send(JSON.stringify(data))
    } catch (err) {
        logger.error('Database error :  ' + err)
        res.sendStatus(501)
    }
})

app.put('/update_user', auth, async function (req, res) {
    try {
        let data = req.body
        data.password_hash = await bcrypt.hash(data.password_hash, 5)
        await sql`UPDATE "BIDS".users SET username = ${data.username}, user_email = ${data.user_email}, password_hash =${data.password_hash}, ad_priv = ${data.ad_priv} WHERE id = ${data.id}`
        res.sendStatus(202)
    } catch (err) {
        logger.error('Database error :  ' + err)
        res.sendStatus(501)
    }
    logger.info('Updated DB users')
})

app.delete('/delete_user', auth, async function (req, res) {
    try {
        await sql`DELETE FROM "BIDS".users WHERE id = ${req.body.id}`
        res.sendStatus(200)
    } catch (err) {
        logger.error('Database error :  ' + err)
        res.sendStatus(501)
    }
    logger.info('User deleted')
})

app.post('/new_user', auth, async function (req, res) {
    try {
        let data = req.body
        data.password_hash = await bcrypt.hash(data.password_hash, 5)
        await sql`INSERT INTO "BIDS".users (username,ad_priv,user_email,password_hash) VALUES(${data.username}, ${data.ad_priv}, ${data.user_email}, ${data.password_hash})`
        logger.info('New user created in DB users')
        res.sendStatus(201)
    } catch (err) {
        logger.error('Database error :  ' + err)
        res.sendStatus(501)
    }
})

app.post('/login', async (req, res) => {
    try {
        let user =
            await sql`select * from "BIDS".users where username = ${req.body.username}`
        if (user.length !== 1) {
            logger.error('Wrong username or password')
            res.status(400).send('Wrong username or password')
        } else {
            let psw_check = await bcrypt.compare(
                req.body.password,  // This parameter is send as password without _hash
                user[0].password_hash
            )
            if (!psw_check) {
                logger.error('Wrong username or password')
                res.status(400).send('Wrong username or password')
            } else {
                jwt.sign(
                    user[0],
                    secretKey,
                    { expiresIn: '12h' },
                    async (err, token) => {
                        if (err) {
                            logger.error('Error on JWT process:' + err)
                            res.status(400).send('Error on JWT process')
                        } else {
                            res.status(200).send(
                                JSON.stringify({
                                    msg: 'Login successful',
                                    token,
                                    email: user[0].user_email,
                                    id: user[0].id,
                                    username: user[0].username,
                                    ad_priv: user[0].ad_priv,
                                })
                            )
                            logger.info(
                                'User ' + user[0].username + ' logged in'
                            )
                        }
                    }
                )
            }
        }
    } catch (err) {
        logger.error('Error on user login:' + err)
        res.status(400).send('Error on user login')
    }
})

/**
 * Server is running locally on port 9500, for now...
 */
var server = app.listen(9500, function () {
    var host = server.address().address
    var port = server.address().port
    console.log('Listening at http://%s:%s', host, port)
})
