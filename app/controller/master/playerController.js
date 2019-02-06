const pgConnection = require('../../model/pgConnection');

const services = require('../../service/service');

const customMsgType = "MASTER_MESSAGE";
const customMsgTypeCM = "COMMON_MESSAGE";

var uniqid = require('uniqid');

module.exports = {

    refundPlayer: async function (req, res) {

        let rules = {
            "player_id": 'required',
            "event_type": 'required',
            "amount": 'required',
            "clarified_by": 'required',
            "refunded_by": 'required'
        };

        var custom_message = {
            "required.player_id": "Player Id is mandatory!",
            "required.event_type": "Event Type is mandatory!",
            "required.amount": "Amount is mandatory!",
            "required.clarified_by": "Clarified by is mandatory!",
            "required.refunded_by": "Refunded by is mandatory!"
        };

        let validation = new services.validator(req.body, rules, custom_message);
        if (validation.passes()) {

            let player_id = req.body.player_id;
            let event_type = req.body.event_type;
            let amount = req.body.amount;
            let clarified_by = req.body.clarified_by;
            let refunded_by = req.body.refunded_by;
            let traxid = uniqid();
            let errMsgType = 'ADD_FAILED';
            let _query;

            if (event_type == "REWARD") {
                _query = {
                    text: "INSERT INTO public.tbl_bonus_credit_que " +
                        " ( event_id, event_type, event_name, amount, " +
                        " \"comment\", player_id, is_credit, status,is_claim, add_date,next_retry, clarified_by, refunded_by) " +
                        " VALUES($1,$2,$3,$4,$5,$6, false, 'ACTIVE',true, now(), now(),$7,$8 )RETURNING que_id, 'coin' as credit_type, amount;",
                    values: [traxid, event_type, event_type, amount, event_type, player_id, clarified_by, refunded_by]
                };

            } else if (event_type == "REFUND") {
                _query = {
                    text: "INSERT INTO public.tbl_wallet_credit_que " +
                        " ( event_id, event_type, event_name, amount, " +
                        " \"comment\", player_id, is_credit, status, add_date,is_claim,next_retry, clarified_by, refunded_by) " +
                        " VALUES($1,$2,$3,$4,$5,$6, false, 'ACTIVE', now(), true, now(),$7,$8)RETURNING que_id, 'cash' as credit_type, amount;",
                    values: [traxid, event_type, event_type, amount, event_type, player_id, clarified_by, refunded_by]
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
    }

}