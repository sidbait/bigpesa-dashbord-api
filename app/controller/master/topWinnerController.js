const pgConnection = require('../../model/pgConnection');
const mv = require('mv');
const services = require('../../service/service');

const customMsgType = "MASTER_MESSAGE";
const customMsgTypeCM = "COMMON_MESSAGE";

module.exports = {

    getAll: async function (req, res) {

        let _selectQuery = "SELECT * FROM tbl_top_winner_event_master"
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
            "event_type": 'required',
            "event_name": 'required',
            "rank": 'required',
            "amount": 'required',
            "credit_type": 'required',
            "status": 'required|in:ACTIVE,DEACTIVE,PENDING',
        };

        let validation = new services.validator(req.body, rules);

        if (validation.passes()) {

            let _event_id = req.body.event_id ? req.body.event_id : null;
            let _event_type = req.body.event_type ? req.body.event_type : null;
            let _event_name = req.body.event_name ? req.body.event_name : null;
            let _rank = req.body.rank ? req.body.rank : null;
            let _amount = req.body.amount ? req.body.amount : null;
            let _credit_type = req.body.credit_type ? req.body.credit_type : null;
            let _status = req.body.status ? req.body.status : null;
            let _created_by = req.body.userid ? req.body.userid : null;
            let _updated_by = req.body.userid ? req.body.userid : null;

            let _query;
            let errMsgType = _event_id ? 'UPDATE_FAILED' : 'ADD_FAILED'
            let successMsgType = _event_id ? 'UPDATE_SUCCESS' : 'ADD_SUCCESS'

            if (!_event_id) {

                _query = {
                    text: "INSERT INTO tbl_top_winner_event_master(event_type,event_name,rank,amount,credit_type,status,created_by,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,now()) RETURNING *",
                    values: [
                        _event_type, _event_name, _rank, _amount, _credit_type, _status, _created_by
                    ]
                }
            }
            else {

                _query = {
                    text: "UPDATE tbl_top_winner_event_master SET event_id=$1,event_type=$2,event_name=$3,rank=$4,amount=$5,credit_type=$6,status=$7,updated_by=$8,updated_at=now() WHERE event_id=$9 RETURNING *",
                    values: [
                        _event_id, _event_type, _event_name, _rank, _amount, _credit_type, _status, _updated_by, _event_id
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
        let _event_type = req.body.event_type ? req.body.event_type : null;
        let _event_name = req.body.event_name ? req.body.event_name : null;
        let _created_at = req.body.created_at ? req.body.created_at : null;
        let _rank = req.body.rank ? req.body.rank : null;
        let _amount = req.body.amount ? req.body.amount : null;
        let _credit_type = req.body.credit_type ? req.body.credit_type : null;
        let _status = req.body.status ? req.body.status : null;

        let _selectQuery = 'SELECT * FROM tbl_top_winner_event_master WHERE  1=1'

        if (_event_id) {
            _selectQuery += " AND event_id = " + _event_id
        }
        if (_event_type) {
            _selectQuery += " AND event_type = " + _event_type
        }
        if (_event_name) {
            _selectQuery += " AND event_name = " + _event_name
        }
        if (_created_at) {
            _selectQuery += " AND created_at = " + _created_at
        }
        if (_rank) {
            _selectQuery += " AND rank = " + _rank
        }
        if (_amount) {
            _selectQuery += " AND amount = " + _amount
        }
        if (_credit_type) {
            _selectQuery += " AND credit_type = " + _credit_type
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