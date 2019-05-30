const pgConnection = require('../../model/pgConnection');

const services = require('../../service/service');

const customMsgType = "MASTER_MESSAGE";
const customMsgTypeCM = "COMMON_MESSAGE";

module.exports = {

    getAll: async function (req, res) {

        let _selectQuery = "SELECT * FROM tbl_scratch_campaign_details"
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
            "camp_id": 'required|numeric',
            "scratch_event_id": 'required|numeric',
            "status": 'required|in:ACTIVE,DEACTIVE,PENDING',
        };

        let obj = req.body
        // deleting null value from req.body
        Object.keys(obj).forEach(k => (obj[k] === 'null') && delete obj[k]);

        let validation = new services.validator(req.body, rules);

        if (validation.passes()) {
            
            let _id = req.body.id ? req.body.id : null;
            let _camp_id = req.body.camp_id ? req.body.camp_id : null;
            let _scratch_event_id = req.body.scratch_event_id ? req.body.scratch_event_id : null;
            let _status = req.body.status ? req.body.status : null;
            let _created_date = req.body.created_date ? req.body.created_date : null;
            let _created_by = req.body.userid ? req.body.userid : null;
            let _updated_by = req.body.userid ? req.body.userid : null;

            let _query;
            let errMsgType = _id ? 'UPDATE_FAILED' : 'ADD_FAILED'
            let successMsgType = _id ? 'UPDATE_SUCCESS' : 'ADD_SUCCESS'

            if (!_id) {

                _query = {
                    text: "INSERT INTO tbl_scratch_campaign_details(camp_id,scratch_event_id,status,created_by,created_at) VALUES ($1,$2,$3,$4,now()) RETURNING id",
                    values: [
                        _camp_id, _scratch_event_id, _status, _created_by
                    ]
                }
            }
            else {

                _query = {
                    text: "UPDATE tbl_scratch_campaign_details SET camp_id=$1,scratch_event_id=$2,status=$3,updated_by=$4,updated_at=now() WHERE id=$5 RETURNING id",
                    values: [
                        _camp_id, _scratch_event_id, _status, _created_by, _id
                    ]
                }

            }
        }

        else {
            services.sendResponse.sendWithCode(req, res, validation.errors.errors, customMsgTypeCM, "VALIDATION_FAILED");

        }
    },

    search: async function (req, res) {

        let _scratch_event_id = req.body.scratch_event_id ? req.body.scratch_event_id : null;
        let _camp_id = req.body._camp_id ? req.body._camp_id : null;
        let _status = req.body.status ? req.body.status : null;
        //let _banner_type = req.body.banner_type ? req.body.banner_type : null;
        let _orderBy = req.body.orderBy ? req.body.orderBy : 'created_date';

        let _selectQuery = 'SELECT * FROM tbl_scratch_campaign_details WHERE  1=1'

        if (_scratch_event_id) {
            _selectQuery += " AND scratch_event_id = " + _scratch_event_id
        }

        if (_camp_id) {
            _selectQuery += " AND camp_id = " + _camp_id
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