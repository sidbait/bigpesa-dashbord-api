const pgConnection = require('../../model/pgConnection');

const services = require('../../service/service');
const push = require('../../model/push.js');

const customMsgType = "MASTER_MESSAGE";
const customMsgTypeCM = "COMMON_MESSAGE";

var uniqid = require('uniqid');

module.exports = {

    getPending: async function (req, res) {

        let rules = {
            "credit_type": 'required'
        };

        var custom_message = {
            "required.credit_type": "Credit Type is mandatory!"
        };

        let validation = new services.validator(req.body, rules, custom_message);
        if (validation.passes()) {

            let credit_type = req.body.credit_type;

            let _selectQuery = "select que_id, player.player_id, phone_number, event_type,amount,\"comment\"," +
                " refunded_by.username as refunded_by";

            if (credit_type == "COIN") {
                _selectQuery += " from tbl_bonus_credit_que as que"
            } else if (credit_type == "CASH") {
                _selectQuery += " from tbl_wallet_credit_que as que"
            }

            _selectQuery +=
                "  left join tbl_player as player on que.player_id = player.player_id" +
                " left join tbl_user as refunded_by on refunded_by.user_id = que.refunded_by" +
                " where que.\"status\" = 'PENDING'";

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
        } else {
            services.sendResponse.sendWithCode(req, res, validation.errors.errors, customMsgTypeCM, "VALIDATION_FAILED");
        }
    },
    refundPlayer: async function (req, res) {

        let rules = {
            "player_id": 'required',
            "event_type": 'required',
            "amount": 'required',
            "comment": 'required',
            "refunded_by": 'required'
        };

        var custom_message = {
            "required.player_id": "Player Id is mandatory!",
            "required.event_type": "Event Type is mandatory!",
            "required.amount": "Amount is mandatory!",
            "required.comment": "Comment is mandatory!",
            "required.refunded_by": "Refunded by is mandatory!"
        };

        let validation = new services.validator(req.body, rules, custom_message);
        if (validation.passes()) {

            let player_id = req.body.player_id;
            let event_type = req.body.event_type;
            let amount = req.body.amount;
            let comment = req.body.comment;
            let refunded_by = req.body.refunded_by;
            let traxid = uniqid();
            let errMsgType = 'ADD_FAILED';
            let _query;

            if (event_type == "REWARD") {
                _query = {
                    text: "INSERT INTO public.tbl_bonus_credit_que " +
                        " ( event_id, event_type, event_name, amount, " +
                        " \"comment\", player_id, is_credit, status,is_claim, add_date,next_retry, refunded_by) " +
                        " VALUES($1,$2,$3,$4,$5,$6, false, 'PENDING',true, now(), now(),$7 )RETURNING que_id, 'coin' as credit_type, amount;",
                    values: [traxid, event_type, event_type, amount, comment, player_id, refunded_by]
                };

            } else if (event_type == "REFUND" || event_type == "DepositBonus") {
                _query = {
                    text: "INSERT INTO public.tbl_wallet_credit_que " +
                        " ( event_id, event_type, event_name, amount, " +
                        " \"comment\", player_id, is_credit, status, add_date,is_claim,next_retry, refunded_by) " +
                        " VALUES($1,$2,$3,$4,$5,$6, false, 'PENDING', now(), true, now(),$7)RETURNING que_id, 'cash' as credit_type, amount;",
                    values: [traxid, event_type, event_type, amount, comment, player_id, refunded_by]
                }
            }
            console.log(_query)
            try {
                let result = await pgConnection.executeQuery('rmg_dev_db', _query)
                console.log(result);
                if (result.length > 0) {
                    services.sendResponse.sendWithCode(req, res, result, customMsgType, "ADD_SUCCESS");
                } else {
                    services.sendResponse.sendWithCode(req, res, error, customMsgType, "ADD_FAILED");
                }
            }
            catch (error) {
                services.sendResponse.sendWithCode(req, res, error, customMsgType, errMsgType);
            }
        } else {
            services.sendResponse.sendWithCode(req, res, validation.errors.errors, customMsgTypeCM, "VALIDATION_FAILED");
        }
    },
    refundApproved: async function (req, res) {

        let rules = {
            "selectedContests": 'required',
            "credit_type": 'required',
            "approved_by": 'required',
            "status": 'required'
        }

        let validation = new services.validator(req.body, rules);

        if (validation.passes()) {

            let _selectedContests = req.body.selectedContests ? req.body.selectedContests : null;
            let _approved_by = req.body.approved_by ? req.body.approved_by : null;
            let _credit_type = req.body.credit_type
            let _status = req.body.status ? req.body.status : null;
            let _updateQuery = "";

            try {

                if (_credit_type == "CASH") {
                    _updateQuery = `update tbl_wallet_credit_que set status = '${_status}', approved_by = '${_approved_by}' where que_id in (${_selectedContests.toString()}) returning que_id`

                } else if (_credit_type == "COIN") {
                    _updateQuery = `update tbl_bonus_credit_que set status = '${_status}', approved_by = '${_approved_by}' where que_id in (${_selectedContests.toString()}) returning que_id`
                }

                let _updated_id = await pgConnection.executeQuery('rmg_dev_db', _updateQuery)
                console.log(_updateQuery);

                services.sendResponse.sendWithCode(req, res, _updated_id, customMsgType, "UPDATE_SUCCESS");
            }
            catch (error) {
                console.log(error);

                services.sendResponse.sendWithCode(req, res, 'error', customMsgTypeCM, "DB_ERROR");
            }
        } else {
            services.sendResponse.sendWithCode(req, res, validation.errors.errors, customMsgTypeCM, "VALIDATION_FAILED");
        }
    },
    unblockPlayer: async function (req, res) {

        let rules = {
            "player_id": 'required',
        }

        let validation = new services.validator(req.body, rules);

        if (validation.passes()) {

            let player_id = req.body.player_id;
            let _updateQuery = "";

            try {

                _updateQuery = `update tbl_player set status = 'ACTIVE' where player_id = (${player_id}) returning player_id`

                let _updated_id = await pgConnection.executeQuery('rmg_dev_db', _updateQuery)
                console.log(_updateQuery);

                services.sendResponse.sendWithCode(req, res, _updated_id, customMsgType, "UPDATE_SUCCESS");
            }
            catch (error) {
                console.log(error);

                services.sendResponse.sendWithCode(req, res, 'error', customMsgTypeCM, "DB_ERROR");
            }
        } else {
            services.sendResponse.sendWithCode(req, res, validation.errors.errors, customMsgTypeCM, "VALIDATION_FAILED");
        }
    },
    updatePlayerStatus: async function (req, res) {

        let rules = {
            "player_id": 'required',
            "status": 'required'
        }

        let validation = new services.validator(req.body, rules);

        if (validation.passes()) {

            let player_id = req.body.player_id;
            let status = req.body.status;
            let _insertQuery = "";
            let _updateQuery = "";
            let _deleteQuery = "";

            try {

                _updateQuery = `update tbl_player set status = '${status}' where player_id = ${player_id} returning phone_number`

                let result = await pgConnection.executeQuery('rmg_dev_db', _updateQuery)
                console.log(_updateQuery);
                console.log('_phone_number - ', result[0].phone_number);
                let _phone_number = result[0].phone_number;
                if (status == 'BLOCK') {
                    push.sendNotification(_phone_number, 'Bigpesa Account', 'Your Bigpesa Account has been Blocked. Due to suspicious activity.')
                    _insertQuery = `insert into tbl_player_block_device(device_id, blocked_at, reason)
                    select distinct device_id, NOW(), 'Found Playing with GameGuardian' from tbl_player_device d
                    join tbl_player p on p.player_id = d.player_id
                    where p.player_id = ${player_id}`

                    let insertresult = await pgConnection.executeQuery('rmg_dev_db', _insertQuery)
                    console.log(_insertQuery);
                    console.log(insertresult);

                } else {
                    push.sendNotification(_phone_number, 'Bigpesa Account', 'Greetings from Bigpesa!! your account is now activated. start fair-playing and win big.')

                    _deleteQuery = `delete from tbl_player_block_device where device_id in(select device_id from tbl_player_device d
                        join tbl_player p on p.player_id = d.player_id
                        where p.player_id = ${player_id})`;

                    let deleteresult = await pgConnection.executeQuery('rmg_dev_db', _deleteQuery)
                    console.log(_deleteQuery);
                    console.log(deleteresult);
                }

                services.sendResponse.sendWithCode(req, res, result, customMsgType, "UPDATE_SUCCESS");
            }
            catch (error) {
                console.log(error);

                services.sendResponse.sendWithCode(req, res, 'error', customMsgTypeCM, "DB_ERROR");
            }
        } else {
            services.sendResponse.sendWithCode(req, res, validation.errors.errors, customMsgTypeCM, "VALIDATION_FAILED");
        }
    },
    getOTP: async function (req, res) {
        let rules = {
            "player_id": 'required',
        };

        let validation = new services.validator(req.body, rules);

        if (validation.passes()) {

            let player_id = req.body.player_id ? req.body.player_id : null;

            let _selectQuery = `select otp_pin as otp,created_at as sent_on from tbl_otp
         where 1=1 `;

            if (player_id) {
                _selectQuery += `and player_id = '${player_id}'`;
            }

            _selectQuery += ` order by created_at desc limit 1`

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

        else {
            services.sendResponse.sendWithCode(req, res, validation.errors.errors, customMsgTypeCM, "VALIDATION_FAILED");

        }
    }

}