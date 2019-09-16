const pgConnection = require('../../model/pgConnection');

const services = require('../../service/service');

const customMsgType = "MASTER_MESSAGE";
const customMsgTypeCM = "COMMON_MESSAGE";

module.exports = {

    getPendingCount: async function (req, res) {

        let _selectQuery = `select event_name, base_type, count(1) as pending from tbl_scheduled_sms sms_log
        inner join tbl_message_event mevent on
        mevent.me_id = sms_log.me_id
        group by event_name, base_type
union all
select event_name, base_type, count(1) as pending from tbl_scheduled_push push_log
        inner join tbl_message_event mevent on
        mevent.me_id = push_log.me_id
        group by event_name, base_type`;

        try {
            let dbResult = await pgConnection.executeQuery('rmg_dev_db', _selectQuery)

            if (dbResult && dbResult.length > 0) {
                services.sendResponse.sendWithCode(req, res, dbResult, customMsgType, "GET_SUCCESS");
            }
            else
                services.sendResponse.sendWithCode(req, res, dbResult, customMsgType, "GET_FAILED");
        }
        catch (error) {
            services.sendResponse.sendWithCode(req, res, error, customMsgTypeCM, "DB_ERROR");
        }
    },

    addBlockedNumbers: async function (req, res) {

        let rules = {
            "numbers": 'required'
        };

        let obj = req.body
        // deleting null value from req.body
        Object.keys(obj).forEach(k => (obj[k] === 'null') && delete obj[k]);
        let _numbers = req.body.numbers ? req.body.numbers : null;

        let validation = new services.validator(req.body, rules);

        if (validation.passes()) {
            try {

                let insertQueries = await getinsertQuerie(_numbers.split(","));

                Promise.all(insertQueries.map(async (query) => {
                    return await pgConnection.executeQuery('rmg_dev_db', query);
                })).then((inresults) => {
                    // console.log(inresults);
                    res.send({ "ok": inresults })
                })

            }
            catch (error) {

                services.sendResponse.sendWithCode(req, res, error, customMsgType, errMsgType);
            }
        }

        else {
            services.sendResponse.sendWithCode(req, res, validation.errors.errors, customMsgTypeCM, "VALIDATION_FAILED");

        }
    },

    getbasetypecount: async function (req, res) {

        let _base_type = req.body.base_type ? req.body.base_type : null;
        let _date_range = req.body.date_range ? req.body.date_range : null;
        let _pastdays = req.body.pastdays ? req.body.pastdays : null;
        let _base_from_date = req.body.base_from_date ? req.body.base_from_date : null;
        let _base_to_date = req.body.base_to_date ? req.body.base_to_date : null;

        let _query = `select count(distinct player.player_id) from tbl_player player`;


        switch (_base_type) {
            case "test":
                _query += " where player.phone_number in('919930104412','918097642971','919969320125','917208689212','918600366639','919867636396')";
                break;

            case "active":
                _query += ` inner join tbl_visitors visitors on
                player.player_id = visitors.playerid
                WHERE 1 = 1
                and (visitors.visit_date + 330::double precision * '00:01:00'::interval)::date >= '2019-04-27'::date AND visitors.playerid IS NOT NULL 
                and player.phone_number_verified = true
                and player.status = 'ACTIVE'`;

                if (_date_range == 'past') {
                    _query += ` and (visitors.visit_date + 330::DOUBLE PRECISION * '00:01:00'::INTERVAL)::DATE >= (now() + 330::DOUBLE PRECISION * '00:01:00'::INTERVAL)::DATE - ${_pastdays}`
                } else if (_date_range == 'between') {
                    _query += ` and (visitors.visit_date + 330::DOUBLE PRECISION * '00:01:00'::INTERVAL)::DATE between '${_base_from_date}' and '${_base_to_date}'`
                }
                break;

            case "registerd":
                _query += ` where player.phone_number_verified = true
                        and player.status = 'ACTIVE'`;

                if (_date_range == 'past') {
                    _query += ` and (player.created_at + 330::DOUBLE PRECISION * '00:01:00'::INTERVAL)::DATE >= (now() + 330::DOUBLE PRECISION * '00:01:00'::INTERVAL)::DATE - ${_pastdays}`
                } else if (_date_range == 'between') {
                    _query += ` and (player.created_at + 330::DOUBLE PRECISION * '00:01:00'::INTERVAL)::DATE between '${_base_from_date}' and '${_base_to_date}'`
                }
                break;

            case "not_verified":
                _query += ` where player.phone_number_verified = false`;

                if (_date_range == 'past') {
                    _query += ` and (player.created_at + 330::DOUBLE PRECISION * '00:01:00'::INTERVAL)::DATE >= (now() + 330::DOUBLE PRECISION * '00:01:00'::INTERVAL)::DATE - ${_pastdays}`
                } else if (_date_range == 'between') {
                    _query += ` and (player.created_at + 330::DOUBLE PRECISION * '00:01:00'::INTERVAL)::DATE between '${_base_from_date}' and '${_base_to_date}'`
                }
                break;

            case "registerd_not_played":
                _query += ` left join tbl_contest_players contest_players on player.player_id = contest_players.player_id
                            where contest_players.player_id is null and player.phone_number_verified = true and player.status = 'ACTIVE'`;

                if (_date_range == 'past') {
                    _query += ` and (player.created_at + 330::DOUBLE PRECISION * '00:01:00'::INTERVAL)::DATE >= (now() + 330::DOUBLE PRECISION * '00:01:00'::INTERVAL)::DATE - ${_pastdays}`
                } else if (_date_range == 'between') {
                    _query += ` and (player.created_at + 330::DOUBLE PRECISION * '00:01:00'::INTERVAL)::DATE between '${_base_from_date}' and '${_base_to_date}'`
                }
                break;

            case "deposit_not_played":
                _query += ` inner join (SELECT distinct player_id FROM tbl_wallet_transaction transactions
                                where nz_txn_type = 'DEPOSIT' and nz_txn_status = 'SUCCESS') as transactions
                                on player.player_id = transactions.player_id
                                where not exists (select distinct player_id from tbl_contest_players contest_players
                                where player.player_id = contest_players.player_id`;

                if (_date_range == 'past') {
                    _query += ` and (transaction_date + 330::DOUBLE PRECISION * '00:01:00'::INTERVAL)::DATE >= (now() + 330::DOUBLE PRECISION * '00:01:00'::INTERVAL)::DATE - ${_pastdays}`
                } else if (_date_range == 'between') {
                    _query += ` and (transaction_date + 330::DOUBLE PRECISION * '00:01:00'::INTERVAL)::DATE between '${_base_from_date}' and '${_base_to_date}'`
                }

                _query += `) and player.status = 'ACTIVE'`;

                break;

            case "never_deposit":
                _query += ` WHERE NOT EXISTS (SELECT distinct transactions.player_id FROM tbl_wallet_transaction transactions
                                where nz_txn_type = 'DEPOSIT' and nz_txn_status = 'SUCCESS'
                                and player.player_id = transactions.player_id) 
                                and player.channel != 'Playstore' and player.phone_number_verified = true and player.status = 'ACTIVE'`;

                if (_date_range == 'past') {
                    _query += ` and (player.created_at + 330::DOUBLE PRECISION * '00:01:00'::INTERVAL)::DATE >= (now() + 330::DOUBLE PRECISION * '00:01:00'::INTERVAL)::DATE - ${_pastdays}`
                } else if (_date_range == 'between') {
                    _query += ` and (player.created_at + 330::DOUBLE PRECISION * '00:01:00'::INTERVAL)::DATE between '${_base_from_date}' and '${_base_to_date}'`
                }
                break;

            case "scratch_contest_winner":
                _query += ` inner join tbl_scratch_campaign_prizes_details scratch 
                    on scratch.player_id = player.player_id
                    where is_win = true and player.phone_number_verified = true and player.status = 'ACTIVE'`;

                if (_date_range == 'past') {
                    _query += ` and (winner_date + 330::DOUBLE PRECISION * '00:01:00'::INTERVAL)::DATE >= (now() + 330::DOUBLE PRECISION * '00:01:00'::INTERVAL)::DATE - ${_pastdays}`
                } else if (_date_range == 'between') {
                    _query += ` and (winner_date + 330::DOUBLE PRECISION * '00:01:00'::INTERVAL)::DATE between '${_base_from_date}' and '${_base_to_date}'`
                }
                break;
            default:
                break;
        }
        console.log('_query', _query);

        try {
            let dbResult = await pgConnection.executeQuery('rmg_dev_db', _query)

            if (dbResult && dbResult.length > 0) {
                services.sendResponse.sendWithCode(req, res, dbResult, customMsgType, "GET_SUCCESS");
            }
            else
                services.sendResponse.sendWithCode(req, res, dbResult, customMsgType, "GET_FAILED");
        }
        catch (error) {
            services.sendResponse.sendWithCode(req, res, error, customMsgTypeCM, "DB_ERROR");
        }
    },

    getMessageLogCount: async function (req, res) {

        let _selectQuery = `select event_name, base_type, tbl_scheduled_msg_log.message, from_date::date::text, count(1) as log_count from tbl_scheduled_msg_log
        join tbl_message_event
        on tbl_message_event.me_id = tbl_scheduled_msg_log.me_id
        group by event_name,base_type,tbl_scheduled_msg_log.message, from_date::date::text
        order by from_date::date::text desc`;

        try {
            let dbResult = await pgConnection.executeQuery('rmg_dev_db', _selectQuery)

            if (dbResult && dbResult.length > 0) {
                services.sendResponse.sendWithCode(req, res, dbResult, customMsgType, "GET_SUCCESS");
            }
            else
                services.sendResponse.sendWithCode(req, res, dbResult, customMsgType, "GET_FAILED");
        }
        catch (error) {
            services.sendResponse.sendWithCode(req, res, error, customMsgTypeCM, "DB_ERROR");
        }
    },

    getNotificationLogCount: async function (req, res) {

        let _selectQuery = `select event_name, base_type, tbl_scheduled_push_log.message, from_date::date::text, count(1) as log_count from tbl_scheduled_push_log
        join tbl_message_event
        on tbl_message_event.me_id = tbl_scheduled_push_log.me_id
        group by event_name,base_type,tbl_scheduled_push_log.message, from_date::date::text
        order by from_date::date::text desc`;

        try {
            let dbResult = await pgConnection.executeQuery('rmg_dev_db', _selectQuery)

            if (dbResult && dbResult.length > 0) {
                services.sendResponse.sendWithCode(req, res, dbResult, customMsgType, "GET_SUCCESS");
            }
            else
                services.sendResponse.sendWithCode(req, res, dbResult, customMsgType, "GET_FAILED");
        }
        catch (error) {
            services.sendResponse.sendWithCode(req, res, error, customMsgTypeCM, "DB_ERROR");
        }
    },
}

async function getinsertQuerie(numbers) {

    return new Promise((resolve, reject) => {
        let insertQuerie = []

        for (let i = 0; i < numbers.length; i++) {

            let _query = `INSERT INTO tbl_message_blocked_numbers(phone_number,created_at) VALUES (${numbers[i]},now())`

            insertQuerie.push(_query)
        }

        resolve(insertQuerie)
    });
}