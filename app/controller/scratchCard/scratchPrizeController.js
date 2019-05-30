const pgConnection = require('../../model/pgConnection');

const services = require('../../service/service');

const customMsgType = "MASTER_MESSAGE";
const customMsgTypeCM = "COMMON_MESSAGE";

module.exports = {

    getAll: async function (req, res) {

        let _selectQuery = "SELECT * FROM tbl_scratch_prize_master"
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
            "prize_title":'required',
            "prize_amount": 'required',
            "status": 'required|in:ACTIVE,DEACTIVE,PENDING',
        };

        let obj = req.body
        // deleting null value from req.body
        Object.keys(obj).forEach(k => (obj[k] === 'null') && delete obj[k]);

        let validation = new services.validator(req.body, rules);

        if (validation.passes()) {

            let _prize_id = req.body.prize_id ? req.body.prize_id : null;
            let _prize_code = req.body.prize_code ? req.body.prize_code : null;
            let _prize_description = req.body.prize_description ? req.body.prize_description : null;
            let _prize_amount = req.body.prize_amount ? req.body.prize_amount : null;
            let _gratification_type = req.body.gratification_type ? req.body.gratification_type : null;
            let _prize_title = req.body.prize_title ? req.body.prize_title : null;
            let _status = req.body.status ? req.body.status : null;
            let _created_date = req.body.created_date ? req.body.created_date : null;
            let _created_by = req.body.userid ? req.body.userid : null;
            let _updated_by = req.body.userid ? req.body.userid : null;

            let _query;
            let errMsgType = _prize_id ? 'UPDATE_FAILED' : 'ADD_FAILED'
            let successMsgType = _prize_id ? 'UPDATE_SUCCESS' : 'ADD_SUCCESS'

            if (!_prize_id) {

                _query = {
                    text: "INSERT INTO tbl_scratch_prize_master(prize_code,prize_description,prize_amount,gratification_type,status,prize_title,created_by,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,now()) RETURNING prize_id",
                    values: [
                        _prize_code, _prize_description, _prize_amount, _gratification_type, _status, _prize_title, _created_by
                    ]
                }
            }
            else {

                _query = {
                    text: "UPDATE tbl_scratch_prize_master SET prize_code=$1,prize_description=$2,prize_amount=$3,gratification_type=$4,status=$5,prize_title=$6,updated_by=$7,updated_at=now() WHERE prize_id=$8 RETURNING prize_id",
                    values: [
                        _prize_code, _prize_description, _prize_amount, _gratification_type, _status, _prize_title, _updated_by, _prize_id
                    ]
                }

            }

            try {

                let result = await pgConnection.executeQuery('rmg_dev_db', _query)


                if (result.length > 0) {

                    if (req.files != null && req.files.length > 0) {
                        // let movePath = await uploadBanner(req, result[0].contest_master_id);
                        let s3Path = await services.s3.upload(req, 'scratchprize');
                        let mvQuery = {
                            text: "UPDATE tbl_scratch_prize_master set prize_image = $1 WHERE prize_id= $2 RETURNING prize_image",
                            values: [
                                s3Path,
                                result[0].prize_id
                            ]
                        }

                        let mvResult = await pgConnection.executeQuery('rmg_dev_db', mvQuery)

                        console.log(mvResult);
                    }

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

        let _prize_id = req.body.prize_id ? req.body.prize_id : null;
        let _status = req.body.status ? req.body.status : null;
        //let _banner_type = req.body.banner_type ? req.body.banner_type : null;
        let _orderBy = req.body.orderBy ? req.body.orderBy : 'prize_title';

        let _selectQuery = 'SELECT * FROM tbl_scratch_prize_master WHERE  1=1'

        if (_prize_id) {
            _selectQuery += " AND prize_id = " + _prize_id
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