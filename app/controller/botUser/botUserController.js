const pgConnection = require('../../model/pgConnection');

const services = require('../../service/service');

const customMsgType = "MASTER_MESSAGE";
const customMsgTypeCM = "COMMON_MESSAGE";

module.exports = {

    chkCanAdd: async function (req, res) {
        let userId = req.body.userId ? req.body.userId : null;
        if ((userId == '420559314854608897' || userId == '418513611208785923' || userId == '414259009505296385') ? true : false) {
            services.sendResponse.sendWithCode(req, res, true, customMsgType, "GET_SUCCESS");
        } else {
            services.sendResponse.sendWithCode(req, res, false, customMsgType, "GET_FAILED");
        }
    },

    getBots: async function (req, res) {

        let _selectQuery = "select tbl_player.player_id,full_name,phone_number,photo,status from tbl_player inner join tbl_bot_users on tbl_player.player_id = tbl_bot_users.player_id where tbl_bot_users.player_id = tbl_player.player_id"

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


    getLiveContests: async function (req, res) {

        let _player_id = req.body.player_id ? req.body.player_id : null;

        let _selectQuery = `select tbl_contest.start_date::date,tbl_contest.end_date::date,tbl_contest.from_time,tbl_contest.to_time,
        tbl_contest.contest_name,tbl_app.app_name,tbl_app.app_id, tbl_contest_leader_board.total_score,tbl_contest_leader_board.contest_leader_board_id,
        tbl_contest_leader_board.contest_id
        from tbl_contest_leader_board inner join tbl_contest 
        on tbl_contest.contest_id = tbl_contest_leader_board.contest_id
        inner join tbl_app on tbl_app.app_id = tbl_contest_leader_board.app_id
        where tbl_contest_leader_board.player_id = ${_player_id}
        and now()::timestamptz + (330::int * '1m'::interval) between tbl_contest.start_date and tbl_contest.end_date`;

        try {
            let dbResult = await pgConnection.executeQuery('rmg_dev_db', _selectQuery)

            if (dbResult && dbResult.length > 0) {
                services.sendResponse.sendWithCode(req, res, dbResult, customMsgType, "GET_SUCCESS");
            } else {
                services.sendResponse.sendWithCode(req, res, dbResult, customMsgType, "GET_FAILED");
            }
        }
        catch (error) {
            services.sendResponse.sendWithCode(req, res, error, customMsgTypeCM, "DB_ERROR");
        }

    },

    getOldContests: async function (req, res) {

        let _player_id = req.body.player_id ? req.body.player_id : null;

        let _selectQuery = `select tbl_contest.start_date::date,tbl_contest.end_date::date,tbl_contest.from_time,tbl_contest.to_time,
        tbl_contest.contest_name,tbl_app.app_name, tbl_contest_leader_board.total_score,tbl_contest_leader_board.contest_leader_board_id,
        tbl_contest_leader_board.contest_id
        from tbl_contest_leader_board inner join tbl_contest 
        on tbl_contest.contest_id = tbl_contest_leader_board.contest_id
        inner join tbl_app on tbl_app.app_id = tbl_contest_leader_board.app_id
        where tbl_contest_leader_board.player_id = ${_player_id}
        order by tbl_contest.start_date desc limit 50`;

        try {
            let dbResult = await pgConnection.executeQuery('rmg_dev_db', _selectQuery)

            if (dbResult && dbResult.length > 0) {
                services.sendResponse.sendWithCode(req, res, dbResult, customMsgType, "GET_SUCCESS");
            } else {
                services.sendResponse.sendWithCode(req, res, dbResult, customMsgType, "GET_FAILED");
            }
        }
        catch (error) {
            services.sendResponse.sendWithCode(req, res, error, customMsgTypeCM, "DB_ERROR");
        }

    },

    updateScore: async function (req, res) {

        let contest_leader_board_id = req.body.contest_leader_board_id ? req.body.contest_leader_board_id : null;
        let new_score = req.body.new_score ? req.body.new_score : null;

        let _updateQuery = `update tbl_contest_leader_board set total_score = ${new_score} where contest_leader_board_id = ${contest_leader_board_id} returning contest_leader_board_id,player_id`;


        try {
            let dbResult = await pgConnection.executeQuery('rmg_dev_db', _updateQuery)

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

    getScoreBoard: async function (req, res) {

        let _contest_id = req.body.contest_id ? req.body.contest_id : null;

        let _selectQuery = `select total_score,tbl_player.full_name,tbl_player.phone_number,tbl_player.player_id from tbl_contest_leader_board 
        inner join tbl_player on tbl_player.player_id = tbl_contest_leader_board.player_id
        where contest_id = ${_contest_id} order by total_score desc`;

        try {
            let dbResult = await pgConnection.executeQuery('rmg_dev_db', _selectQuery)

            if (dbResult && dbResult.length > 0) {
                services.sendResponse.sendWithCode(req, res, dbResult, customMsgType, "GET_SUCCESS");
            } else {
                services.sendResponse.sendWithCode(req, res, dbResult, customMsgType, "GET_FAILED");
            }
        }
        catch (error) {
            services.sendResponse.sendWithCode(req, res, error, customMsgTypeCM, "DB_ERROR");
        }

    },

    searchPlayer: async function (req, res) {

        let player_id = req.body.player_id ? req.body.player_id : null;
        let phone_number = req.body.phone_number ? req.body.phone_number : null;

        let _selectQuery = `select player_id,full_name,phone_number,photo,status from tbl_player where player_id = ${player_id} or phone_number = '${phone_number}'`;

        try {
            let dbResult = await pgConnection.executeQuery('rmg_dev_db', _selectQuery)

            if (dbResult && dbResult.length > 0) {
                services.sendResponse.sendWithCode(req, res, dbResult, customMsgType, "GET_SUCCESS");
            } else {
                services.sendResponse.sendWithCode(req, res, dbResult, customMsgType, "GET_FAILED");
            }
        }
        catch (error) {
            services.sendResponse.sendWithCode(req, res, error, customMsgTypeCM, "DB_ERROR");
        }

    },

    addNewBot: async function (req, res) {

        let player_id = req.body.player_id ? req.body.player_id : null;

        let _insertQuery = `INSERT INTO public.tbl_bot_users (player_id, created_by, created_at) VALUES(${player_id}, 0, now()) returning player_id;`;

        try {
            let dbResult = await pgConnection.executeQuery('rmg_dev_db', _insertQuery)

            if (dbResult && dbResult.length > 0) {
                services.sendResponse.sendWithCode(req, res, dbResult, customMsgType, "GET_SUCCESS");
            } else {
                services.sendResponse.sendWithCode(req, res, dbResult, customMsgType, "GET_FAILED");
            }
        }
        catch (error) {
            services.sendResponse.sendWithCode(req, res, error, customMsgTypeCM, "DB_ERROR");
        }

    },
}