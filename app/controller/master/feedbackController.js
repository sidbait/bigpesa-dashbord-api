const pgConnection = require('../../model/pgConnection');

const services = require('../../service/service');

const customMsgType = "MASTER_MESSAGE";
const customMsgTypeCM = "COMMON_MESSAGE";

module.exports = {

    getAll: async function (req, res) {

        let _selectQuery = "select *,feedback.created_at as feedback_date,feedback.player_id as pid,feedback.\"status\" as feedback_status" +
            " from tbl_feedback feedback" +
            " inner join tbl_player player on player.player_id = feedback.player_id" +
            " order by feedback_date desc";

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

    update: async function (req, res) {

        let rules = {
            "feedback_id": 'required',
            "feedback_status": 'required'
        };

        var custom_message = {
            "required.feedback_id": "Feedback Id is mandatory!",
            "required.feedback_status": "Feedback Status is mandatory!",
        };

        let validation = new services.validator(req.body, rules, custom_message);

        if (validation.passes()) {

            let _feedback_id = req.body.feedback_id ? req.body.feedback_id : null;
            let _comments = req.body.comments ? req.body.comments : null;
            let _status = req.body.feedback_status ? req.body.feedback_status : null;

            /* let _userid = req.body.userid ? req.body.userid : null;
            let _apiChecksum = req.body.checksum;
            let _userToken = req.body.checksum; */

            let queryText, valuesArr;
            let errMsgType = _feedback_id ? 'UPDATE_FAILED' : 'FAILED_REGISTERED'
            let successMsgType = _feedback_id ? 'UPDATE_SUCCESS' : 'REGISTERED_SUCCESS'

            queryText = `UPDATE tbl_feedback
                            SET
                            comments=$1,
                            status=$2
                            WHERE feedback_id=$3
                            RETURNING *`;

            valuesArr = [_comments, _status, _feedback_id]

            try {

                let _query = {
                    text: queryText,
                    values: valuesArr
                };

                let response = {}

                let result = await pgConnection.executeQuery('rmg_dev_db', _query)

                console.log(result);
                if (result.length > 0) {
                    services.sendResponse.sendWithCode(req, res, result[0], customMsgType, successMsgType);
                    /*  if (result[0][Object.keys(result[0])[0]] == 'Insert') {
 
                         response = {
                             appid : result[0]
                         }
                         services.sendResponse.sendWithCode(req, res, response, customMsgType, "REGISTERED_SUCCESS");       
                     }
                     if (result[0].fn_master_addupdatecountry == undefined || result[0].fn_master_addupdatecountry == null) {
                         services.sendResponse.sendWithCode(req, res, response, customMsgType, "ALREADY_REGISTERED");
                     }
                     else if (result[0].fn_master_addupdatecountry > 0) {
                         response = {
                             countryid: result[0].fn_master_addupdatecountry,
                             country: _country,
                             countrycode: _countrycode,
                             status: _status
                         }
                         services.sendResponse.sendWithCode(req, res, response, customMsgType, "REGISTERED_SUCCESS");
                     }
                     else {
                         services.sendResponse.sendWithCode(req, res, response, customMsgType, "FAILED_REGISTERED");
                     } */
                } else {
                    console.log('len', result.length)
                    services.sendResponse.sendWithCode(req, res, error, customMsgType, errMsgType);
                }
            }
            catch (error) {
                services.sendResponse.sendWithCode(req, res, error, customMsgType, errMsgType);
            }
        }
        else {
            services.sendResponse.sendWithCode(req, res, validation.errors.errors, customMsgTypeCM, "VALIDATION_FAILED");
        }
    },

    search: async function (req, res) {

        let _feedback_id = req.body.feedback_id ? req.body.feedback_id : null;

        let _selectQuery = "select *,feedback.created_at as feedback_date,feedback.player_id as pid,feedback.\"status\" as feedback_status" +
            " from tbl_feedback feedback" +
            " inner join tbl_player player on player.player_id = feedback.player_id";

        if (_feedback_id) {
            _selectQuery += " where feedback_id = " + _feedback_id
        }

        _selectQuery += " order by feedback_date desc";

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