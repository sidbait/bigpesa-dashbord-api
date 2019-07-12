const pgConnection = require('../../model/pgConnection');

const services = require('../../service/service');

const customMsgType = "MASTER_MESSAGE";
const customMsgTypeCM = "COMMON_MESSAGE";

module.exports = {

    getAll: async function (req, res) {

        let _selectQuery = "SELECT * FROM tbl_event_master"
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
            // "event_id": 'required|numeric',
            // "app_id": 'required|numeric',
            "event_name": 'required',
            "event_type": 'required',
            // "event_desc": 'required',
            "bonus_amount": 'required',
            // "is_repeat": 'required',
            // "repeat_count": 'required',
            // "rowid": 'required|numeric',
            "credit_type": 'required',
            "bonus_toplayer": 'required',
            "credit_type_toplayer": 'required',
            "status": 'required|in:ACTIVE,DEACTIVE,PENDING',
        };

        let obj = req.body
        // deleting null value from req.body
        Object.keys(obj).forEach(k => (obj[k] === 'null' || obj[k] === 'undefined') && delete obj[k]);

        let validation = new services.validator(req.body, rules);

        if (validation.passes()) {

            let _event_id = req.body.event_id ? req.body.event_id : null;
            let _app_id = req.body.app_id ? req.body.app_id : 387198134678028289;
            let _event_name = req.body.event_name ? req.body.event_name : null;
            let _event_type = req.body.event_type ? req.body.event_type : null;
            let _event_desc = req.body.event_desc ? req.body.event_desc : null;
            let _bonus_amount = req.body.bonus_amount ? req.body.bonus_amount : null;
            let _is_repeat = req.body.is_repeat ? req.body.is_repeat : null;
            let _repeat_count = req.body.repeat_count ? req.body.repeat_count : null;
            let _credit_type = req.body.credit_type ? req.body.credit_type : null;
            let _bonus_toplayer = req.body.bonus_toplayer ? req.body.bonus_toplayer : null;
            let _credit_type_toplayer = req.body.credit_type_toplayer ? req.body.credit_type_toplayer : null;
            let _status = req.body.status ? req.body.status : null;
            let _created_by = req.body.userid ? req.body.userid : null;
            let _updated_by = req.body.userid ? req.body.userid : null;

            let _query;
            let errMsgType = _event_id ? 'UPDATE_FAILED' : 'ADD_FAILED'
            let successMsgType = _event_id ? 'UPDATE_SUCCESS' : 'ADD_SUCCESS'

            if (!_event_id) {

                _query = {
                    text: "INSERT INTO tbl_event_master(app_id,event_name,event_type,event_desc,bonus_amount,is_repeat,repeat_count,credit_type,bonus_toplayer,credit_type_toplayer,status,created_by,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,now()) RETURNING *",
                    values: [
                        _app_id, _event_name, _event_type, _event_desc, _bonus_amount, _is_repeat, _repeat_count, _credit_type, _bonus_toplayer, _credit_type_toplayer, _status, _created_by
                    ]
                }
            }
            else {

                _query = {
                    text: "UPDATE tbl_event_master SET event_id=$1,app_id=$2,event_name=$3,event_type=$4,event_desc=$5,bonus_amount=$6,is_repeat=$7,repeat_count=$8,credit_type=$9,bonus_toplayer=$10,credit_type_toplayer=$11,status=$12,updated_by=$13,updated_at=now() WHERE event_id=$14 RETURNING *",
                    values: [
                        _event_id, _app_id, _event_name, _event_type, _event_desc, _bonus_amount, _is_repeat, _repeat_count, _credit_type, _bonus_toplayer, _credit_type_toplayer, _status, _updated_by, _event_id
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

        let _event_id = req.body.event_id ? req.body.event_id : null;
        let _app_id = req.body.app_id ? req.body.app_id : null;
        let _event_name = req.body.event_name ? req.body.event_name : null;
        let _event_type = req.body.event_type ? req.body.event_type : null;
        let _bonus_amount = req.body.bonus_amount ? req.body.bonus_amount : null;
        let _credit_type = req.body.credit_type ? req.body.credit_type : null;
        let _bonus_toplayer = req.body.bonus_toplayer ? req.body.bonus_toplayer : null;
        let _credit_type_toplayer = req.body.credit_type_toplayer ? req.body.credit_type_toplayer : null;
        let _status = req.body.status ? req.body.status : null;

        let _selectQuery = 'SELECT * FROM tbl_event_master WHERE  1=1'

        if (_event_id) {
            _selectQuery += " AND event_id = " + _event_id
        }
        if (_app_id) {
            _selectQuery += " AND app_id = " + _app_id
        }
        if (_event_name) {
            _selectQuery += " AND event_name = " + _event_name
        }
        if (_event_type) {
            _selectQuery += " AND event_type = " + _event_type
        }
        if (_bonus_amount) {
            _selectQuery += " AND bonus_amount = " + _bonus_amount
        }
        if (_credit_type) {
            _selectQuery += " AND credit_type = " + _credit_type
        }
        if (_bonus_toplayer) {
            _selectQuery += " AND bonus_toplayer = " + _bonus_toplayer
        }
        if (_credit_type_toplayer) {
            _selectQuery += " AND credit_type_toplayer = " + _credit_type_toplayer
        }
        if (_status) {
            _selectQuery += " AND status = " + _status
        }

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

    }

}