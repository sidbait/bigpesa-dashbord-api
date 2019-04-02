const pgConnection = require('../../model/pgConnection');
const services = require('../../service/service');

const customMsgType = "MASTER_MESSAGE";
const customMsgTypeCM = "COMMON_MESSAGE";

module.exports = {

    getScoreData: async function (req, res) {

        let id = req.body.id;
        let app_id = req.body.app_id ? req.body.app_id : '';

        let _selectQuery = 'select tbl_app.app_name,tbl_score_validation.* from tbl_score_validation inner join tbl_app on tbl_app.app_id = tbl_score_validation.app_id where 1=1'

        if (app_id) {
            _selectQuery += ` AND tbl_score_validation.app_id = '${app_id}'`
        }

        if (id) {
            _selectQuery += ` AND tbl_score_validation.id = '${id}'`
        }

        _selectQuery += ` order by tbl_app.app_name`

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

    add: async (req, res) => {

        let rules = {
            // "app_id": 'required|numeric',
            "suspicious": 'required',
            "maximum": 'required',
            "status": 'required|in:ACTIVE,DEACTIVE,PENDING',
        };

        let validation = new services.validator(req.body, rules);

        if (validation.passes()) {
            let _id = req.body.id ? req.body.id : null;
            let _app_id = req.body.app_id ? req.body.app_id : null;
            let _suspicious = req.body.suspicious ? req.body.suspicious : null;
            let _maximum = req.body.maximum ? req.body.maximum : null;
            let _status = req.body.status ? req.body.status : null;
            let _created_by = req.body.userid ? req.body.userid : null;
            let _updated_by = req.body.userid ? req.body.userid : null;

            let _query;
            let errMsgType = _id ? 'UPDATE_FAILED' : 'ADD_FAILED'
            let successMsgType = _id ? 'UPDATE_SUCCESS' : 'ADD_SUCCESS'

            if (!_id) {

                _query = {
                    text: "INSERT INTO tbl_score_validation(app_id,suspicious,maximum,status,created_by,created_at) VALUES ($1,$2,$3,$4,$5,now()) RETURNING *",
                    values: [
                        _app_id, _suspicious, _maximum, _status, _created_by
                    ]
                }
            }
            else {

                _query = {
                    text: "UPDATE tbl_score_validation SET app_id=$1,suspicious=$2,maximum=$3,status=$4,updated_by=$5,updated_at=now() WHERE id=$6 RETURNING *",
                    values: [
                        _app_id, _suspicious, _maximum, _status, _updated_by, _id
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
    }



}
