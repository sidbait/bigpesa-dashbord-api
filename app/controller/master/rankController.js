const pgConnection = require('../../model/pgConnection');

const services = require('../../service/service');

const customMsgType = "MASTER_MESSAGE";
const customMsgTypeCM = "COMMON_MESSAGE";

module.exports = {

    getAll: async function (req, res) {

        let _selectQuery = "Select * From tbl_contest_rank_master"
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
            "contestmasterid": 'required',
            "rankname": 'required',
            "lowerrank": 'required',
            "upperrank": 'required',
            "prizeamount": 'required',
            "status": 'required',
            "credittype": 'required'
        };

        let validation = new services.validator(req.body, rules);

        if (validation.passes()) {

            let _contestrankmasterid = req.body.contestrankmasterid ? req.body.contestrankmasterid : null;
            let _contestmasterid = req.body.contestmasterid ? req.body.contestmasterid : null;
            let _rankname = req.body.rankname ? req.body.rankname : null;
            let _rankdesc = req.body.rankdesc ? req.body.rankdesc : null;
            let _lowerrank = req.body.lowerrank ? req.body.lowerrank : null;
            let _upperrank = req.body.upperrank ? req.body.upperrank : null;
            let _prizeamount = req.body.prizeamount ? req.body.prizeamount : null;
            let _status = req.body.status ? req.body.status : null;
            let _createdby = null;
            let _createdat = 'now()'
            let _updatedby = null;
            let _updatedat = 'now()'
            let _credittype = req.body.credittype ? req.body.credittype : null;

            let queryText, valuesArr;
            let errMsgType = _contestrankmasterid ? 'UPDATE_FAILED' : 'FAILED_REGISTERED'
            let successMsgType = _contestrankmasterid ? 'UPDATE_SUCCESS' : 'REGISTERED_SUCCESS'

            if (!_contestrankmasterid) {

                queryText = "INSERT INTO tbl_contest_rank_master (contest_master_id,rank_name,rank_desc,lower_rank,upper_rank,prize_amount,status,created_by,created_at,updated_by,updated_at,credit_type) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),$9, NOW(),$10) RETURNING *";

                valuesArr = [_contestmasterid, _rankname, _rankdesc, _lowerrank, _upperrank, _prizeamount, _status, _createdby, _updatedby, _credittype]

            }
            else {

                queryText = `UPDATE tbl_contest_rank_master
                            SET
                            contest_master_id=$1,
                            rank_name=$2,
                            rank_desc=$3,
                            lower_rank=$4,
                            upper_rank=$5,
                            prize_amount=$6,
                            status=$7,
                            updated_by=$8,
                            updated_at=NOW(),
                            credit_type=$9
                            WHERE contest_rank_master_id=$10
                            RETURNING *`;

                valuesArr = [_contestmasterid, _rankname, _rankdesc, _lowerrank, _upperrank, _prizeamount, _status, _updatedby, _credittype, _contestrankmasterid]

            }

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
            "contestmasterid": 'required'
        }

        let validation = new services.validator(req.body, rules);

        if (validation.passes()) {

            let _contestrankmasterid = req.body.appid ? req.body.appid : null;
            let _contestmasterid = req.body.contestmasterid ? req.body.contestmasterid : null;
            let _status = req.body.status ? req.body.status : null;

            let _selectQuery = 'Select * From tbl_contest_rank_master'

            if (_contestrankmasterid) {
                _selectQuery += " where contest_rank_master_id = " + _contestrankmasterid
            }

            if (_contestmasterid) {
                _selectQuery += _contestrankmasterid ? ' and ' : ' where '
                _selectQuery += " contest_master_id = '" + _contestmasterid + "'"
            }

            if (_status) {
                _selectQuery += (_contestrankmasterid || _contestmasterid) ? ' and ' : ' where '
                _selectQuery += " status = '" + _status + "'"
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