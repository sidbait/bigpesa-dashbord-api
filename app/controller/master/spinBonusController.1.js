const pgConnection = require('../../model/pgConnection');

const services = require('../../service/service');

const customMsgType = "MASTER_MESSAGE";
const customMsgTypeCM = "COMMON_MESSAGE";

module.exports = {

    getAll: async function (req, res) {

        let _selectQuery = "SELECT * FROM tbl_dailybonus_spin_master"
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
            "spintext": 'required',
            "credittype": 'required',
            "amount": 'required'
        };

        let validation = new services.validator(req.body, rules);

        if (validation.passes()) {

            let _spinbonusid = req.body.spinbonusid ? req.body.spinbonusid : null;
            let _spintext = req.body.spintext ? req.body.spintext : null;
            let _spinimg = req.body.spinimg ? req.body.spinimg : null;
            let _credittype = req.body.credittype ? req.body.credittype : null;
            let _amount = req.body.amount ? req.body.amount : null;
            let _status = req.body.status ? req.body.status : 'DE-ACTIVE';
            let _createdby = null;
            let _createdat = 'now()'
            let _updatedby = null;
            let _updatedat = 'now()'
            let _isvalid = req.body.isvalid ? req.body.isvalid : false;

            let queryText, valuesArr;
            let errMsgType = _spinbonusid ? 'UPDATE_FAILED' : 'FAILED_REGISTERED'
            let successMsgType = _spinbonusid ? 'UPDATE_SUCCESS' : 'REGISTERED_SUCCESS'

            if (!_spinbonusid) {

                queryText = "INSERT INTO tbl_dailybonus_spin_master (spin_text,spin_img,credit_type,amount,status,created_by,created_at,updated_by,updated_at,isvalid) VALUES ($1,$2,$3,$4,$5,$6,NOW(),$7,NOW(),$8) RETURNING *";

                valuesArr = [_spintext, _spinimg, _credittype, _amount, _status, _createdby, _updatedby, _isvalid]

            }
            else {

                queryText = `UPDATE tbl_dailybonus_spin_master
                            SET
                            spin_text=$1,
                            spin_img=$2,
                            credit_type=$3,
                            amount=$4,
                            status=$5,
                            updated_by=$6,
                            updated_at=NOW(),
                            isvalid=$7
                            WHERE id=$8
                            RETURNING *`;

                valuesArr = [_spintext, _spinimg, _credittype, _amount, _status, _updatedby, _isvalid, _spinbonusid]

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

        let _spinbonusid = req.body.spinbonusid ? req.body.spinbonusid : null;
        let _spintext = req.body.spintext ? req.body.spintext : null;
        let _credittype = req.body.credittype ? req.body.credittype : null;
        let _status = req.body.status ? req.body.status : null;
        let _isvalid = req.body.isvalid ? req.body.isvalid : null;


        let _selectQuery = 'SELECT * FROM tbl_dailybonus_spin_master'

        if (_spinbonusid) {
            _selectQuery += " WHERE id = " + _spinbonusid
        }

        if (_spintext) {
            _selectQuery += _spinbonusid ? ' AND ' : ' WHERE '
            _selectQuery += " spin_text LIKE '" + _spintext + "%'"
        }

        if (_status) {
            _selectQuery += (_spinbonusid || _spintext) ? ' AND ' : ' WHERE '
            _selectQuery += " status = '" + _status + "'"
        }

        if (_credittype) {
            _selectQuery += (_spinbonusid || _spintext || _status) ? ' AND ' : ' WHERE '
            _selectQuery += " credit_type = '" + _credittype + "'"
        }

        if (_isvalid) {
            _selectQuery += (_spinbonusid || _spintext || _status || _credittype) ? ' AND ' : ' WHERE '
            _selectQuery += " isvalid = '" + _isvalid + "'"
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