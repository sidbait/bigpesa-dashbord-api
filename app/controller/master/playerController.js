const pgConnection = require('../../model/pgConnection');

const services = require('../../service/service');

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

}