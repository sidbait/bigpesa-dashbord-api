const pgConnection = require('../../model/pgConnection');

const services = require('../../service/service');

const customMsgType = "MASTER_MESSAGE";
const customMsgTypeCM = "COMMON_MESSAGE";

module.exports = {

    getAll: async function (req, res) {

        let _selectQuery = "SELECT * FROM tbl_scratch_campaign_prizes_details"
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
            "prize_id": 'required|numeric',
            "status": 'required|in:ACTIVE,DEACTIVE,PENDING',
        };

        let obj = req.body
        // deleting null value from req.body
        Object.keys(obj).forEach(k => (obj[k] === 'null') && delete obj[k]);

        let validation = new services.validator(req.body, rules);

        if (validation.passes()) {
            
            let _id = req.body.id ? req.body.id : null;
            let _camp_id = req.body.camp_id ? req.body.camp_id : null;
            let _prize_id = req.body.prize_id ? req.body.prize_id : null;
            let _prize_type = req.body.prize_type ? req.body.prize_type : null;
            let _is_win = req.body.is_win ? req.body.is_win : false;
            let _is_credited = req.body.is_credited ? req.body.is_credited : false;
            let _is_claim = req.body.is_claim ? req.body.is_claim : false;
            let _amount = req.body.amount ? req.body.amount : null;
            let _status = req.body.status ? req.body.status : null;
            let _created_date = req.body.created_date ? req.body.created_date : null;
            let _created_by = req.body.userid ? req.body.userid : null;
            let _updated_by = req.body.userid ? req.body.userid : null;

            let _start_date = req.body.start_date ? req.body.start_date : null;
            let _end_date = req.body.end_date ? req.body.end_date : null;
            let _from_time = req.body.from_time ? req.body.from_time : null;
            let _to_time = req.body.to_time ? req.body.to_time : null;

            let _new_start_date = joinDateTime(_start_date, _from_time);
            let _new_end_date = joinDateTime(_end_date, _to_time);

            let _query;
            let errMsgType = _id ? 'UPDATE_FAILED' : 'ADD_FAILED'
            let successMsgType = _id ? 'UPDATE_SUCCESS' : 'ADD_SUCCESS'

            if (!_id) {

                _query = {
                    text: "INSERT INTO tbl_scratch_campaign_prizes_details(camp_id,prize_id,prize_type,from_date,to_date,is_win,is_credited,is_claim,amount,status,created_by,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,now()) RETURNING id",
                    values: [
                        _camp_id, _prize_id, _prize_type, _new_start_date, _new_end_date, _is_win, _is_credited, _is_claim, _amount, _status, _created_by
                    ]
                }
            }
            else {

                _query = {
                    text: "UPDATE tbl_scratch_campaign_prizes_details SET camp_id=$1,prize_id=$2,prize_type=$3,from_date=$4,to_date=$5,is_win=$6,is_credited=$7,is_claim=$8,amount=$9,status=$10,updated_by=$11,updated_at=now() WHERE id=$12 RETURNING id",
                    values: [
                        _camp_id, _prize_id, _prize_type, _new_start_date, _new_end_date, _is_win, _is_credited, _is_claim, _amount, _status, _updated_by, _id
                    ]
                }

            }
        }

        else {
            services.sendResponse.sendWithCode(req, res, validation.errors.errors, customMsgTypeCM, "VALIDATION_FAILED");

        }
    },

    search: async function (req, res) {

        let _prize_id = req.body.prize_id ? req.body.prize_id : null;
        let _camp_id = req.body._camp_id ? req.body._camp_id : null;
        let _status = req.body.status ? req.body.status : null;
        //let _banner_type = req.body.banner_type ? req.body.banner_type : null;
        let _orderBy = req.body.orderBy ? req.body.orderBy : 'camp_id';

        let _selectQuery = 'SELECT * FROM tbl_scratch_campaign_prizes_details WHERE  1=1'

        if (_prize_id) {
            _selectQuery += " AND prize_id = " + _prize_id
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

function joinDateTime(date, time) {
    let new_date = date + 'T' + time + 'Z';
    return new_date
}