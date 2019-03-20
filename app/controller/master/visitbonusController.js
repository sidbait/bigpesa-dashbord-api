const pgConnection = require('../../model/pgConnection');

const services = require('../../service/service');

const customMsgType = "MASTER_MESSAGE";
const customMsgTypeCM = "COMMON_MESSAGE";

module.exports = {

    getAll: async function (req, res) {

        let _selectQuery = "SELECT * FROM tbl_visitbonus_master"
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
            // "id": 'required|numeric',
            "fromtime": 'required',
            "totime": 'required',
            "credit_type": 'required',
            "credit_bonus": 'required',
            "status": 'required|in:ACTIVE,DEACTIVE,PENDING',
            // "datetime": 'required',
            "type": 'required',
        };
        console.log(req.body);

        let validation = new services.validator(req.body, rules);

        if (validation.passes()) {

            let _id = req.body.id ? req.body.id : null;
            let _fromtime = req.body.fromtime ? req.body.fromtime : null;
            let _totime = req.body.totime ? req.body.totime : null;
            let _credit_type = req.body.credit_type ? req.body.credit_type : null;
            let _credit_bonus = req.body.credit_bonus ? req.body.credit_bonus : null;
            let _status = req.body.status ? req.body.status : null;
            let _datetime = req.body.datetime ? req.body.datetime : null;
            let _type = req.body.type ? req.body.type : null;
            let _created_by = req.body.userid ? req.body.userid : null;
            let _updated_by = req.body.userid ? req.body.userid : null;

            let _query;
            let errMsgType = _id ? 'UPDATE_FAILED' : 'ADD_FAILED'
            let successMsgType = _id ? 'UPDATE_SUCCESS' : 'ADD_SUCCESS'

            if (!_id) {

                _query = {
                    text: "INSERT INTO tbl_visitbonus_master(fromtime,totime,credit_type,credit_bonus,status,datetime,type,created_by,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,now()) RETURNING *",
                    values: [
                        _fromtime, _totime, _credit_type, _credit_bonus, _status, _datetime, _type, _created_by
                    ]
                }
            }
            else {

                _query = {
                    text: "UPDATE tbl_visitbonus_master SET fromtime=$1,totime=$2,credit_type=$3,credit_bonus=$4,status=$5,datetime=$6,type=$7,updated_by=$8,updated_at=now() WHERE id=$9 RETURNING *",
                    values: [
                        _fromtime, _totime, _credit_type, _credit_bonus, _status, _datetime, _type, _updated_by, _id
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

        let _visitbonus_id = req.body.visitbonus_id ? req.body.visitbonus_id : null;

        let _selectQuery = 'SELECT * FROM tbl_visitbonus_master WHERE  1=1'

        if (_visitbonus_id) {
            _selectQuery += " AND id = " + _visitbonus_id
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

    },

    getById: async function (req, res) {

        let _visitbonus_id = req.body.visitbonus_id ? req.body.visitbonus_id : null;

        let _selectQuery = "SELECT * FROM tbl_visitbonus_master WHERE  1=1 AND id = " + _visitbonus_id;

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