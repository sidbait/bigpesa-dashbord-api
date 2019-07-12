const pgConnection = require('../../model/pgConnection');

const services = require('../../service/service');

const customMsgType = "MASTER_MESSAGE";
const customMsgTypeCM = "COMMON_MESSAGE";

module.exports = {

    getAll: async function (req, res) {

        let _selectQuery = "SELECT * FROM tbl_message_event"
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
            "event_name": 'required',
            "status": 'required|in:ACTIVE,DEACTIVE,PENDING',
        };

        let obj = req.body
        // deleting null value from req.body
        Object.keys(obj).forEach(k => (obj[k] === 'null') && delete obj[k]);

        let validation = new services.validator(req.body, rules);

        if (validation.passes()) {

            let _me_id = req.body.me_id ? req.body.me_id : null;
            let _event_name = req.body.event_name ? req.body.event_name : null;
            let _priority = req.body.priority ? req.body.priority : null;
            let _status = req.body.status ? req.body.status : null;

            let _query;
            let errMsgType = _me_id ? 'UPDATE_FAILED' : 'ADD_FAILED'
            let successMsgType = _me_id ? 'UPDATE_SUCCESS' : 'ADD_SUCCESS'

            if (!_me_id) {

                _query = {
                    text: "INSERT INTO tbl_message_event(event_name,priority,status) VALUES ($1,$2,$3) RETURNING me_id",
                    values: [
                        _event_name, _priority, _status
                    ]
                }
            }
            else {

                _query = {
                    text: "UPDATE tbl_message_event SET event_name=$1,priority=$2,status=$3 WHERE me_id= $4 RETURNING me_id",
                    values: [
                        _event_name, _priority, _status, _me_id
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
        let _event_name = req.body.event_name ? req.body.event_name : null;
        let _status = req.body.status ? req.body.status : null;
        let _orderBy = req.body.orderBy ? req.body.orderBy : 'event_name';

        let _selectQuery = 'SELECT * FROM tbl_message_event WHERE  1=1'

        if (_me_id) {
            _selectQuery += " AND me_id = " + _me_id
        }

        if (_event_name) {
            _selectQuery += " AND event_name = " + _event_name
        }

        if (_status) {
            _selectQuery += " AND status = '" + _status + "'"
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