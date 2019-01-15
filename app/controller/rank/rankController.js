const pgConnection = require('../../model/pgConnection');

const services = require('../../service/service');

const customMsgType = "MASTER_MESSAGE";
const customMsgTypeCM = "COMMON_MESSAGE";

module.exports = {

    getAll: async function (req, res) {

        let _selectQuery = "Select * From tbl_contest_rank"
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
            // "contest_rank_id": 'required|numeric',
            "contest_id": 'required|numeric',
            "rank_name": 'required',
            "rank_desc": 'required',
            "lower_rank": 'required',
            "upper_rank": 'required',
            "prize_amount": 'required',
            "credit_type": 'required',
            "status": 'required',
        };

        let validation = new services.validator(req.body, rules);

        if (validation.passes()) {

            let _contest_rank_id = req.body.contest_rank_id ? req.body.contest_rank_id : null;
            let _contest_id = req.body.contest_id ? req.body.contest_id : null;
            let _rank_name = req.body.rank_name ? req.body.rank_name : null;
            let _rank_desc = req.body.rank_desc ? req.body.rank_desc : null;
            let _lower_rank = req.body.lower_rank ? req.body.lower_rank : null;
            let _upper_rank = req.body.upper_rank ? req.body.upper_rank : null;
            let _prize_amount = req.body.prize_amount ? req.body.prize_amount : null;
            let _credit_type = req.body.credit_type ? req.body.credit_type : null;
            let _status = req.body.status ? req.body.status : null;
            let _created_by = req.body.userid ? req.body.userid : null;
            let _updated_by = req.body.userid ? req.body.userid : null;

            let _query;
            let errMsgType = _contest_id ? 'UPDATE_FAILED' : 'ADD_FAILED'
            let successMsgType = _contest_id ? 'UPDATE_SUCCESS' : 'ADD_SUCCESS'

            if (!_contest_rank_id) {

                _query = {
                    text: "INSERT INTO tbl_contest_rank(contest_id,rank_name,rank_desc,lower_rank,upper_rank,prize_amount,credit_type,status,created_by ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *",
                    values: [
                        _contest_id, _rank_name, _rank_desc, _lower_rank, _upper_rank, _prize_amount, _credit_type, _status,_created_by 
                    ]
                }
            }
            else {

                _query = {
                    text: "UPDATE tbl_contest_rank SET contest_rank_id=$1,contest_id=$2,rank_name=$3,rank_desc=$4,lower_rank=$5,upper_rank=$6,prize_amount=$7,credit_type=$8,status=$9,updated_by=$11 WHERE contest_rank_id=$10 RETURNING *",
                    values: [
                        _contest_rank_id, _contest_id, _rank_name, _rank_desc, _lower_rank, _upper_rank, _prize_amount, _credit_type, _status, _contest_rank_id, _updated_by
                    ]
                }

            }

            try {

                let result = await pgConnection.executeQuery('rmg_dev_db', _query)

                // console.log(result);

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

        let rules = {
            "contest_id": 'required'
        }

        let validation = new services.validator(req.body, rules);

        if (validation.passes()) {

            let _contest_rank_id = req.body.contest_rank_id ? req.body.contest_rank_id : null;
            let _contest_id = req.body.contest_id ? req.body.contest_id : null;
            let _status = req.body.status ? req.body.status : null;

            let _selectQuery = 'Select * From tbl_contest_rank where 1=1 '

            if (_contest_rank_id) {
                _selectQuery += " AND contest_rank_id = '" + _contest_rank_id + "'"
            }

            if (_contest_id) {
                _selectQuery += " AND contest_id = '" + _contest_id + "'"
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

        } else {

            services.sendResponse.sendWithCode(req, res, validation.errors.errors, customMsgTypeCM, "VALIDATION_FAILED");

        }
    }

}