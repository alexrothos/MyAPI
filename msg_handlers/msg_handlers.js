/**
 * Database handler and configuration (it wil be changed later to get from system)
 */
const config = require('../conf/config.json')
const postgres = require('postgres')
// The password is set as option and overwrites the password of the url
// because it has the @ character.
const sql = postgres(config.DB.url) //, { password: 'Lass2019@' })

const log4js = require('log4js')
log4js.configure('./conf/log4js.json')
const logger = log4js.getLogger()
const logRec = log4js.getLogger('record')

// Record control //
let toLogger = true
let toDb = true

const stompClient = require('../stompf/stompf')

/**
 * This function makes an entry to database for  requests.
 */
const addMsg = async (resp, mp, u) => {
    try {
        await sql`insert into "BIDS".responses (response,player_id) values (${resp},${mp})`
        await sql`update "BIDS".user_commands set command_result = ${resp} where command_id = ${u}` // <-- Error here?
    } catch (err) {
        logger.error('ERROR WRITING TO DB responses : ' + err)
    }
    logger.info('Wrote to DB at responses')
}

/**
 * This function makes an entry to the database that keeps the
 * media player records
 * @param {text} a - the media player's ID (ex. SUM_N3)
 * @param {text} b - the hall (ex. North)
 * @param {text} d - location of the media player
 * @param {text} e - last known player_id
 * @param {text} f - last known ip
 * @param {text} i - fixed ip
 * @param {text} g - group of the command received
 * @param {text} m - record value
 */
let addPlayer = async (a, b, d, e, f, i, g, m) => {
    if (toDb) {
        let arr =
            await sql`SELECT EXISTS(SELECT 1 FROM "BIDS".media_stats WHERE player_id = ${a})`
        if (arr[0].exists === true) {
            try {
                if (g === 1) {
                    await sql`UPDATE "BIDS".media_stats SET hall = ${b}, location = ${d}, last_known_player_id = ${e}, last_known_ip = ${f}, fixed_ip = ${i}, last_heartbeat = to_timestamp(${Date.now()} / 1000.0), mon_status = ${m} WHERE player_id = ${a}`
                } else if (g === 2) {
                    await sql`UPDATE "BIDS".media_stats SET hall = ${b}, location = ${d}, last_known_player_id = ${e}, last_known_ip = ${f}, fixed_ip = ${i}, last_heartbeat = to_timestamp(${Date.now()} / 1000.0), temperature = ${m} WHERE player_id = ${a}`
                } else if (g === 3) {
                    await sql`UPDATE "BIDS".media_stats SET hall = ${b}, location = ${d}, last_known_player_id = ${e}, last_known_ip = ${f}, fixed_ip = ${i}, last_heartbeat = to_timestamp(${Date.now()} / 1000.0), vol_level = ${m} WHERE player_id = ${a}`
                } else if (g === 4) {
                    await sql`UPDATE "BIDS".media_stats SET hall = ${b}, location = ${d}, last_known_player_id = ${e}, last_known_ip = ${f}, fixed_ip = ${i}, last_heartbeat = to_timestamp(${Date.now()} / 1000.0), mon_serial = ${m} WHERE player_id = ${a}`
                } else if (g === 7) {
                    await sql`UPDATE "BIDS".media_stats SET hall = ${b}, location = ${d}, last_known_player_id = ${e}, last_known_ip = ${f}, fixed_ip = ${i}, last_heartbeat = to_timestamp(${Date.now()} / 1000.0), mute = ${m} WHERE player_id = ${a}`
                } else if (g === 5) {
                    await sql`UPDATE "BIDS".media_stats SET hall = ${b}, location = ${d}, last_known_player_id = ${e}, last_known_ip = ${f}, fixed_ip = ${i}, last_heartbeat = to_timestamp(${Date.now()} / 1000.0), brightness = ${m} WHERE player_id = ${a}`
                } else if (g === 6) {
                    await sql`UPDATE "BIDS".media_stats SET hall = ${b}, location = ${d}, last_known_player_id = ${e}, last_known_ip = ${f}, fixed_ip = ${i}, last_heartbeat = to_timestamp(${Date.now()} / 1000.0), contrast = ${m} WHERE player_id = ${a}`
                } else if (g === 8) {
                    await sql`UPDATE "BIDS".media_stats SET hall = ${b}, location = ${d}, last_known_player_id = ${e}, last_known_ip = ${f}, fixed_ip = ${i}, last_heartbeat = to_timestamp(${Date.now()} / 1000.0), lock = ${m} WHERE player_id = ${a}`
                } else if (g === 10) {
                    await sql`UPDATE "BIDS".media_stats SET hall = ${b}, location = ${d}, last_known_player_id = ${e}, last_known_ip = ${f}, fixed_ip = ${i}, last_heartbeat = to_timestamp(${Date.now()} / 1000.0), current_server = ${m} WHERE player_id = ${a}`
                } else {
                    await sql`UPDATE "BIDS".media_stats SET hall = ${b}, location = ${d}, last_known_player_id = ${e}, last_known_ip = ${f}, fixed_ip = ${i}, last_heartbeat = to_timestamp(${Date.now()} / 1000.0), WHERE player_id = ${a}`
                }
            } catch (err) {
                logger.error('ERROR UPDATING DB : ' + err)
                //throw 'ERROR UPDATING DB : ' + err
            }
            logger.info('Updated DB media_stats')
        } else {
            try {
                if (g === 1) {
                    await sql`insert into "BIDS".media_stats (player_id,hall,location,last_known_player_id,last_known_ip,fixed_ip, mon_status, last_heartbeat) values (${a},${b},${d},${e},${f},${i},${m},to_timestamp(${Date.now()} / 1000.0))`
                } else if (g === 2) {
                    await sql`insert into "BIDS".media_stats (player_id,hall,location,last_known_player_id,last_known_ip,fixed_ip, temperature, last_heartbeat) values (${a},${b},${d},${e},${f},${i},${m},to_timestamp(${Date.now()} / 1000.0))`
                } else if (g === 3) {
                    await sql`insert into "BIDS".media_stats (player_id,hall,location,last_known_player_id,last_known_ip,fixed_ip, vol_level, last_heartbeat) values (${a},${b},${d},${e},${f},${i},${m},to_timestamp(${Date.now()} / 1000.0))`
                } else if (g === 4) {
                    await sql`insert into "BIDS".media_stats (player_id,hall,location,last_known_player_id,last_known_ip,fixed_ip, mon_serial, last_heartbeat) values (${a},${b},${d},${e},${f},${i},${m},to_timestamp(${Date.now()} / 1000.0))`
                } else if (g === 7) {
                    await sql`insert into "BIDS".media_stats (player_id,hall,location,last_known_player_id,last_known_ip,fixed_ip, mute, last_heartbeat) values (${a},${b},${d},${e},${f},${i},${m},to_timestamp(${Date.now()} / 1000.0))`
                } else if (g === 5) {
                    await sql`insert into "BIDS".media_stats (player_id,hall,location,last_known_player_id,last_known_ip,fixed_ip, brightness, last_heartbeat) values (${a},${b},${d},${e},${f},${i},${m},to_timestamp(${Date.now()} / 1000.0))`
                } else if (g === 6) {
                    await sql`insert into "BIDS".media_stats (player_id,hall,location,last_known_player_id,last_known_ip,fixed_ip, contrast, last_heartbeat) values (${a},${b},${d},${e},${f},${i},${m},to_timestamp(${Date.now()} / 1000.0))`
                } else if (g === 8) {
                    await sql`insert into "BIDS".media_stats (player_id,hall,location,last_known_player_id,last_known_ip,fixed_ip, lock, last_heartbeat) values (${a},${b},${d},${e},${f},${i},${m},to_timestamp(${Date.now()} / 1000.0))`
                } else if (g === 10) {
                    await sql`insert into "BIDS".media_stats (player_id,hall,location,last_known_player_id,last_known_ip,fixed_ip, current_server, last_heartbeat) values (${a},${b},${d},${e},${f},${i},${m},to_timestamp(${Date.now()} / 1000.0))`
                } else {
                    await sql`insert into "BIDS".media_stats (player_id,hall,location,last_known_player_id,last_known_ip,fixed_ip, last_heartbeat) values (${a},${b},${d},${e},${f},${i},to_timestamp(${Date.now()} / 1000.0))`
                }
            } catch (err) {
                logger.error('ERROR INSERTING TO DB : ' + err)
                //throw 'ERROR INSERTING TO DB : ' + err
            }
            logger.info('New entry to DB media_stats')
        }
    }
    if (toLogger) {
        logRec.info(
            'player_id = ' +
                a +
                ', hall = ' +
                b +
                ', location = ' +
                d +
                ', last_known_player_id = ' +
                e +
                ', last_known_ip = ' +
                f +
                ', fixed_ip = ' +
                i
        )
    }
}

/**
 * The function accepts an array and formats the answer
 * to be send
 * @param {json object} data - contains "command" tag and "param"
 * The command is string and the param, because is optional, could be Int or null
 */
async function sender(data) {
    try {
        let uuid =
            await sql`insert into "BIDS".user_commands (username,command_send) values (${data.username},${data.command}) returning command_id`
        let p = data.param
        if (p !== null) {
            p = p.toString(16)
        }
        const command = {
            msg: data.command,
            param: p,
            mp: {
                player_id: data.mp.player_id,
                hall: data.mp.hall,
                location: data.mp.location,
            },
            username: data.username,
            uuid: uuid[0]['command_id'],
        }
        if (data.command === 'change_settings') {
            command.mp2 = {
                player_id: data.mp2.player_id,
                hall: data.mp2.hall,
                location: data.mp2.location,
            }
        }

        stompClient.publish(config.command_topic, JSON.stringify(command))
        console.log(command) // for testing...
    } catch (err) {
        logger.error('Something went wrong with the incoming command : ' + err)
        throw err
    }
}

module.exports = { addMsg, addPlayer, sender }
