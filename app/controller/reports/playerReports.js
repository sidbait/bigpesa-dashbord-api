const pgConnection = require('../../model/pgConnection');

const services = require('../../service/service');

const customMsgType = "MASTER_MESSAGE";
const customMsgTypeCM = "COMMON_MESSAGE";

module.exports = {
    playerReport: async function (req, res) {

        let player_id = req.body.player_id;
        let email_id = req.body.email_id;
        let phone_number = req.body.phone_number;
        if ((player_id != "" && player_id != null && player_id != undefined) ||
            (email_id != "" && email_id != null && email_id != undefined) ||
            (phone_number != "" && phone_number != null && phone_number != undefined)) {
            try {
                if (player_id) {
                    queryText = "select * from vw_admin_user_summary_report where player_id = $1 limit 1";
                    valuesArr = [player_id];
                } else if (email_id) {
                    queryText = "select * from vw_admin_user_summary_report where email_id = $1 limit 1";
                    valuesArr = [email_id];
                } else if (phone_number) {
                    queryText = "select * from vw_admin_user_summary_report where phone_number = $1 limit 1";
                    valuesArr = [phone_number];
                }

                let query = {
                    text: queryText,
                    values: valuesArr
                };

                let result = await pgConnection.executeQuery('rmg_dev_db', query)
                if (result.length > 0) {
                    services.sendResponse.sendWithCode(req, res, result, customMsgType, "GET_SUCCESS");
                } else {
                    services.sendResponse.sendWithCode(req, res, result, customMsgType, "GET_FAILED");
                }
            }
            catch (error) {
                services.sendResponse.sendWithCode(req, res, error, customMsgTypeCM, "DB_ERROR");
            }
        } else {
            services.sendResponse.sendWithCode(req, res, { "msg": "Please provide player_id or email_id or phone_number" }, customMsgTypeCM, "VALIDATION_FAILED");
        }
    },
    playerContestJoinedReport: async function (req, res) {

        let rules = {
            "player_id": 'required',
        };

        var custom_message = {
            "required.player_id": "Player Id is mandatory!"
        };

        let validation = new services.validator(req.body, rules, custom_message);
        if (validation.passes()) {

            let player_id = req.body.player_id;
            try {
                queryText = "select contest.contest_name,contest_players.transaction_amount,contest_players.transaction_id,contest_players.transaction_date" +
                    " from tbl_contest_players contest_players" +
                    " inner join tbl_contest contest on contest_players.contest_id = contest.contest_id" +
                    " where player_id = $1" +
                    " order by contest_players.transaction_date desc";
                valuesArr = [player_id];

                let query = {
                    text: queryText,
                    values: valuesArr
                };

                let result = await pgConnection.executeQuery('rmg_dev_db', query)
                if (result.length > 0) {
                    services.sendResponse.sendWithCode(req, res, result, customMsgType, "GET_SUCCESS");
                } else {
                    services.sendResponse.sendWithCode(req, res, result, customMsgType, "GET_FAILED");
                }
            }
            catch (error) {
                services.sendResponse.sendWithCode(req, res, error, customMsgTypeCM, "DB_ERROR");
            }
        } else {
            services.sendResponse.sendWithCode(req, res, validation.errors.errors, customMsgTypeCM, "VALIDATION_FAILED");
        }
    },
    walletTransactionReport: async function (req, res) {

        let rules = {
            "player_id": 'required',
        };

        var custom_message = {
            "required.player_id": "Player Id is mandatory!"
        };

        let validation = new services.validator(req.body, rules, custom_message);
        if (validation.passes()) {

            let player_id = req.body.player_id;
            try {
                queryText = "select app.app_name,wallet_transaction.amount,wallet_transaction.created_at, wallet_transaction.nz_txn_type,wallet_transaction.nz_txn_status" +
                    " from tbl_wallet_transaction wallet_transaction" +
                    " inner join tbl_app app on wallet_transaction.app_id = app.app_id" +
                    " where wallet_transaction.player_id = $1" +
                    " order by wallet_transaction.created_at desc";
                valuesArr = [player_id];

                let query = {
                    text: queryText,
                    values: valuesArr
                };

                let result = await pgConnection.executeQuery('rmg_dev_db', query)
                if (result.length > 0) {
                    services.sendResponse.sendWithCode(req, res, result, customMsgType, "GET_SUCCESS");
                } else {
                    services.sendResponse.sendWithCode(req, res, result, customMsgType, "GET_FAILED");
                }
            }
            catch (error) {
                services.sendResponse.sendWithCode(req, res, error, customMsgTypeCM, "DB_ERROR");
            }
        } else {
            services.sendResponse.sendWithCode(req, res, validation.errors.errors, customMsgTypeCM, "VALIDATION_FAILED");
        }
    },
    playerContestWinReport: async function (req, res) {

        let rules = {
            "player_id": 'required',
        };

        var custom_message = {
            "required.player_id": "Player Id is mandatory!"
        };

        let validation = new services.validator(req.body, rules, custom_message);
        if (validation.passes()) {

            let player_id = req.body.player_id;
            try {
                queryText = "select app.app_name,contest.contest_name," +
                    "contest_winner.player_rank,contest_winner.win_amount," +
                    "contest_winner.credit_type,contest_winner.transaction_date" +
                    " from tbl_contest_winner contest_winner" +
                    " inner join tbl_contest contest on contest_winner.contest_id = contest.contest_id" +
                    " inner join tbl_app app on contest_winner.app_id = app.app_id" +
                    " where player_id = $1 order by contest_winner.transaction_date desc";
                valuesArr = [player_id];

                let query = {
                    text: queryText,
                    values: valuesArr
                };

                let result = await pgConnection.executeQuery('rmg_dev_db', query)
                if (result.length > 0) {
                    services.sendResponse.sendWithCode(req, res, result, customMsgType, "GET_SUCCESS");
                } else {
                    services.sendResponse.sendWithCode(req, res, result, customMsgType, "GET_FAILED");
                }
            }
            catch (error) {
                services.sendResponse.sendWithCode(req, res, error, customMsgTypeCM, "DB_ERROR");
            }
        } else {
            services.sendResponse.sendWithCode(req, res, validation.errors.errors, customMsgTypeCM, "VALIDATION_FAILED");
        }
    },
}