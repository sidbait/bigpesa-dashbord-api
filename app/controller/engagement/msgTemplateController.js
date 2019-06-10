const pgConnection = require('../../model/pgConnection');

const services = require('../../service/service');

const customMsgType = "MASTER_MESSAGE";
const customMsgTypeCM = "COMMON_MESSAGE";

module.exports = {

    getAll: async function (req, res) {

        let _selectQuery = "SELECT * FROM tbl_message_templates"
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

    add: async function (req, res) {

        let rules = {
            "message": 'required',
            "me_id": 'required',
            "message_type": 'required',
            "sms_pipe": 'required',
            "status": 'required|in:ACTIVE,DEACTIVE,PENDING',
        };

        let obj = req.body
        // deleting null value from req.body
        Object.keys(obj).forEach(k => (obj[k] === 'null') && delete obj[k]);

        let validation = new services.validator(req.body, rules);

        if (validation.passes()) {

            let _mt_id = req.body.mt_id ? req.body.mt_id : null;
            let _me_id = req.body.me_id ? req.body.me_id : null;
            let _message = req.body.message ? req.body.message : null;
            let _message_type = req.body.message_type ? req.body.message_type : null;
            let _sms_pipe = req.body.sms_pipe ? req.body.sms_pipe : null;
            let _status = req.body.status ? req.body.status : null;

            let _query;
            let errMsgType = _mt_id ? 'UPDATE_FAILED' : 'ADD_FAILED'
            let successMsgType = _mt_id ? 'UPDATE_SUCCESS' : 'ADD_SUCCESS'

            if (!_mt_id) {

                _query = {
                    text: "INSERT INTO tbl_message_templates(me_id,message,message_type,sms_pipe,status) VALUES ($1,$2,$3,$4,$5) RETURNING mt_id",
                    values: [
                        _me_id, _message, _message_type, _sms_pipe, _status
                    ]
                }
            }
            else {

                _query = {
                    text: "UPDATE tbl_message_templates SET me_id=$1,message=$2,message_type=$3,sms_pipe=$4,status=$5 WHERE mt_id= $6 RETURNING mt_id",
                    values: [
                        _me_id, _message, _message_type, _sms_pipe, _status, _mt_id
                    ]
                }

            }

            try {

                let result = await pgConnection.executeQuery('rmg_dev_db', _query)

                if (result.length > 0) {

                    services.sendResponse.sendWithCode(req, res, result[0], customMsgType, successMsgType);
                } else {
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

        let _me_id = req.body.me_id ? req.body.me_id : null;
        let _mt_id = req.body.mt_id ? req.body.mt_id : null;
        let _message = req.body.message ? req.body.message : null;
        let _message_type = req.body.message_type ? req.body.message_type : null;
        let _sms_pipe = req.body.sms_pipe ? req.body.sms_pipe : null;
        let _status = req.body.status ? req.body.status : null;
        let _orderBy = req.body.orderBy ? req.body.orderBy : 'message_type';

        let _selectQuery = 'SELECT mt_id,tbl_message_templates.me_id, event_name,message,message_type,sms_pipe,tbl_message_templates.status FROM tbl_message_templates inner join tbl_message_event on tbl_message_templates.me_id = tbl_message_event.me_id WHERE  1=1'

        if (_me_id) {
            _selectQuery += " AND tbl_message_templates.me_id = " + _me_id
        }

        if (_mt_id) {
            _selectQuery += " AND mt_id = " + _mt_id
        }

        if (_message) {
            _selectQuery += " AND message = " + _message
        }

        if (_message_type) {
            _selectQuery += " AND message_type = " + _message_type
        }

        if (_sms_pipe) {
            _selectQuery += " AND sms_pipe = " + _sms_pipe
        }

        if (_status) {
            _selectQuery += " AND tbl_message_templates.status = '" + _status + "'"
        }

        _selectQuery += " order by " + _orderBy;

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
}