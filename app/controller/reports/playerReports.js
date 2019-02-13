const pgConnection = require('../../model/pgConnection');

const services = require('../../service/service');

const customMsgType = "MASTER_MESSAGE";
const customMsgTypeCM = "COMMON_MESSAGE";
const customMsgTypeBULK = "BULKSMS_MESSAGE";

const csv = require('csvtojson');
const mv = require('mv');
const request = require('request');
var fs = require("fs");

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
                queryText = "select app.app_name, contest.contest_name,contest_players.transaction_amount,contest_players.transaction_id,contest_players.transaction_date" +
                    " from tbl_contest_players contest_players" +
                    " inner join tbl_contest contest on contest_players.contest_id = contest.contest_id" +
                    " inner join tbl_app app on app.app_id = contest.app_id" +
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
                queryText = "select order_id, (amount::decimal + cash_bonus) as amount, created_at, nz_txn_type,nz_txn_status, nz_txn_event_name" +
                    " from tbl_wallet_transaction" +
                    " where player_id = $1" +
                    " order by created_at desc";
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
    bonusTransactionReport: async function (req, res) {

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
                queryText = "select event_type, bonus_type, bonus_value, created_at, \"comment\"" +
                    " from tbl_bonus_transaction" +
                    " where player_id = $1" +
                    " order by created_at desc";
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
    getTransactionDetails: async function (req, res) {

        let rules = {
            "transaction_id": 'required',
        };

        var custom_message = {
            "required.transaction_id": "Transaction Id is mandatory!"
        };

        let validation = new services.validator(req.body, rules, custom_message);
        if (validation.passes()) {

            let transaction_id = req.body.transaction_id;
            try {
                queryText = "select que.transaction_id, amount, contest.contest_id, contest.contest_name, contest.contest_type, start_date::date, contest.from_time, contest.to_time, contest.entry_fee, is_credit, is_claim, transaction_date" +
                    " from tbl_wallet_credit_que as que" +
                    " inner join tbl_contest as contest" +
                    " on contest.contest_id = que.event_id::int" +
                    " where transaction_id = $1";
                valuesArr = [transaction_id];

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
    withdrawDepositTransactionReport: async function (req, res) {

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
                queryText = "select tbl_wallet_transaction.order_id,  tbl_wallet_transaction.created_at, nz_txn_type as transaction_type, amount, nz_txn_status, chmod, pg_source, resp_text" +
                    " from tbl_wallet_transaction" +
                    " left join tbl_wallet_paytm_txn" +
                    " on tbl_wallet_paytm_txn.order_id = tbl_wallet_transaction.order_id" +
                    " where tbl_wallet_transaction.player_id = $1" +
                    " and nz_txn_type in ('WITHDRAW', 'DEPOSIT')" +
                    " order by tbl_wallet_transaction.created_at desc";
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
    playerContestReport: async function (req, res) {

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
                queryText = "select app.app_name, contest.contest_id, contest.contest_name, contest.entry_fee, contest.debit_type," +
                    " contest_players.transaction_date as joined_date," +
                    " contest_winner.player_rank, contest_winner.total_score, contest_winner.win_amount," +
                    " contest_winner.credit_type, contest_winner.transaction_date as winning_date" +
                    " from tbl_app as app" +
                    " inner join tbl_contest as contest on" +
                    " app.app_id = contest.app_id" +
                    " inner join tbl_contest_players as contest_players on" +
                    " contest_players.contest_id = contest.contest_id" +
                    " left join tbl_contest_winner as contest_winner on" +
                    " (contest_winner.contest_id = contest.contest_id) and" +
                    " (contest_winner.player_id = contest_players.player_id)" +
                    " where contest_players.player_id = $1" +
                    " order by winning_date desc";
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
    playerFeedbackReport: async function (req, res) {

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
                queryText = "select feedback_id,topic,details,comments, feedback.created_at, resolved_date, resolved_mode, username as resolved_by, feedback.\"status\" as feedback_status" +
                    " from tbl_feedback feedback" +
                    " left join tbl_user on tbl_user.user_id = feedback.user_id" +
                    " where player_id = $1" +
                    " order by created_at desc";
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
    activePlayerData: async function (req, res) {

        try {
            queryText = "select full_name, phone_number, email_id from tbl_player" +
                " where phone_number_verified = true" +
                " and player_id in(" +
                " select distinct player_id from tbl_contest_players" +
                " where transaction_date::date = current_date::date)";

            let query = {
                text: queryText
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
    },
    inActivePlayerData: async function (req, res) {

        try {
            queryText = "select full_name, phone_number, email_id from tbl_player" +
                " where phone_number_verified = true" +
                " and player_id in(" +
                " select distinct player_id from tbl_contest_players" +
                " where transaction_date::date != current_date::date)";

            let query = {
                text: queryText
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
    },
    verifiedPlayerData: async function (req, res) {

        try {
            queryText = "select full_name, phone_number, email_id from tbl_player" +
                " where phone_number_verified = true";

            let query = {
                text: queryText
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
    },
    verifiedButNotPlayedPlayerData: async function (req, res) {

        try {
            queryText = "select full_name, phone_number, email_id from tbl_player" +
                " left join tbl_contest_players on tbl_player.player_id = tbl_contest_players.player_id" +
                " where tbl_contest_players.player_id is null and tbl_player.phone_number_verified = true";

            let query = {
                text: queryText
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
    },
    bulkSMSNotification: function (req, res) {

        let uploadFilepath = `./public/bulk/SMS/`;
        var data = null;
        var numbers = [];

        let rules = {
            "message": 'required'
        };

        var custom_message = {
            "required.message": "Message is mandatory!"
        };

        let validation = new services.validator(req.body, rules, custom_message);
        if (validation.passes()) {
            let message = req.body.message;
            if (req.files.length > 0) {
                var from_path = req.files[0].destination + req.files[0].filename;
                var splt = req.files[0].originalname.split('.');
                var ext = splt[splt.length - 1];
                if (ext.toLowerCase() == "csv") {
                    var dest_path = new Date().toDateString() + '.' + ext;
                    let moveto = uploadFilepath + dest_path;
                    moveto = moveto.toLowerCase();
                    console.log(from_path);
                    console.log(moveto);
                    mv(from_path, moveto, { mkdirp: true }, function (err) {
                        if (err) {
                            updateflg = false;
                        }
                        else {
                            const csvFilePath = moveto;
                            csv()
                                .fromFile(csvFilePath)
                                .then((jsonObj) => {
                                    console.log('jsonObj ', jsonObj);
                                    if (jsonObj[0].hasOwnProperty('phone_number')) {
                                        for (let index = 0; index < jsonObj.length; index++) {
                                            data = jsonObj[index];
                                            numbers.push(data.phone_number);
                                        }
                                        pushSMS(numbers.join(), message);
                                        services.sendResponse.sendWithCode(req, res, { message: 'File Imported Successfully' }, customMsgTypeBULK, "FILE_IMPORT");
                                    } else {
                                        services.sendResponse.sendWithCode(req, res, { error: "File should have column - phone_number" }, customMsgTypeBULK, "WRONG_HEADER");
                                    }
                                })
                        }
                    });
                }
                else {
                    services.sendResponse.sendWithCode(req, res, { error: "Please provide proper CSV file." }, customMsgTypeCM, "VALIDATION_FAILED");
                }
            } else {
                services.sendResponse.sendWithCode(req, res, validation.errors.errors, customMsgTypeCM, "VALIDATION_FAILED");
            }
        }
        else {
            services.sendResponse.sendWithCode(req, res, validation.errors.errors, customMsgTypeCM, "VALIDATION_FAILED");

        }
    },
    getRefundList: async function (req, res) {

        let _selectQuery = " select que_id, player_id,tbl_refund.\"status\", event_type,amount," +
            " type,\"comment\", refunded_by.username as refunded_by, approved_by.username as approved_by" +
            " from " +
            " (" +
            " select que_id, player_id,\"status\", event_type,amount," +
            "  case when event_type = 'REWARD' then 'COIN' end as type," +
            "  \"comment\", refunded_by, approved_by from tbl_bonus_credit_que" +
            "  where event_type = 'REWARD'" +
            "  union all" +
            "  select que_id, player_id,\"status\", event_type,amount," +
            "  case when event_type = 'REFUND' then 'CASH' end as type," +
            "  \"comment\", refunded_by, approved_by from tbl_wallet_credit_que" +
            "  where event_type = 'REFUND'" +
            "  ) as tbl_refund" +
            "  left join tbl_user as refunded_by on refunded_by.user_id = tbl_refund.refunded_by" +
            "  left join tbl_user as approved_by on approved_by.user_id = tbl_refund.approved_by";

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
    }
}

function pushSMS(numbers, message) {

    let pushSMSUrl = "http://182.18.143.11/api/mt/SendSMS?user=nazara&password=nazara&senderid=BGPESA&channel=Trans&DCS=0&flashsms=0&number=" + numbers + "&text=" + message + "&route=55";
    console.log(pushSMSUrl);
    request(pushSMSUrl, function (error, response, body) {
        console.log('error:', error); // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        console.log('body:', body); // Print the HTML for the Google homepage.

        let uploadFilepath = `./public/bulk/sms/report/` + getDateTime() + `.txt`;
        fs.writeFile(uploadFilepath, body, function (error) {
            if (error) {
                console.error("write error:  " + error.message);
            } else {
                console.log("Successful Write to " + uploadFilepath);
            }
        });
    });

}

function getDateTime() {
    let current_datetime = new Date();
    let formatted_date = current_datetime.getFullYear() + "-" + (current_datetime.getMonth() + 1) + "-" + current_datetime.getDate() + "T" + current_datetime.getHours() + ":" + current_datetime.getMinutes() + ":" + current_datetime.getSeconds();
    return formatted_date;

}