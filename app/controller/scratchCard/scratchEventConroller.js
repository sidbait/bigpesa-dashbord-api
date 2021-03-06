const pgConnection = require('../../model/pgConnection');

const services = require('../../service/service');

const customMsgType = "MASTER_MESSAGE";
const customMsgTypeCM = "COMMON_MESSAGE";

module.exports = {
    getAll: async function (req, res) {

        let _selectQuery = "SELECT * FROM tbl_scratch_event_master"
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
            "name": 'required',
            "amount": 'required',
            "status": 'required|in:ACTIVE,DEACTIVE,PENDING',
        };

        let obj = req.body
        // deleting null value from req.body
        Object.keys(obj).forEach(k => (obj[k] === 'null') && delete obj[k]);

        let validation = new services.validator(req.body, rules);

        if (validation.passes()) {

            let _scratch_event_id = req.body.scratch_event_id ? req.body.scratch_event_id : null;
            let _event_name = req.body.name ? req.body.name : null;
            let _event_code = req.body.event_code ? req.body.event_code : null;
            let _description = req.body.description ? req.body.description : null;
            let _win_description = req.body.win_description ? req.body.win_description : null;
            let _amount = req.body.amount ? req.body.amount : null;
            let _status = req.body.status ? req.body.status : null;
            let _created_date = req.body.created_date ? req.body.created_date : null;
            let _created_by = req.body.userid ? req.body.userid : null;
            let _updated_by = req.body.userid ? req.body.userid : null;

            let _channel = req.body.channel ? req.body.channel : null;

            let _query;
            let errMsgType = _scratch_event_id ? 'UPDATE_FAILED' : 'ADD_FAILED'
            let successMsgType = _scratch_event_id ? 'UPDATE_SUCCESS' : 'ADD_SUCCESS'

            if (!_scratch_event_id) {

                _query = {
                    text: "INSERT INTO tbl_scratch_event_master(name,event_code,channel,amount,status,description,win_description,created_by,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,now()) RETURNING scratch_event_id",
                    values: [
                        _event_name, _event_code, _channel, _amount, _status, _description,_win_description, _created_by
                    ]
                }
            }
            else {

                _query = {
                    text: "UPDATE tbl_scratch_event_master SET name=$1,event_code=$2,channel=$3,amount=$4,status=$5,description=$6,win_description=$7,updated_by=$8,updated_at=now() WHERE scratch_event_id=$9 RETURNING scratch_event_id",
                    values: [
                        _event_name, _event_code, _channel, _amount, _status, _description, _win_description, _updated_by, _scratch_event_id
                    ]
                }

            }

            try {

                let result = await pgConnection.executeQuery('rmg_dev_db', _query)


                if (result.length > 0) {

                    if (req.files != null && req.files.length > 0) {
                        // let movePath = await uploadBanner(req, result[0].contest_master_id);
                        let s3Path = await services.s3.upload(req, 'scratch_card_img');
                        let mvQuery = {
                            text: "UPDATE tbl_scratch_event_master set image = $1 WHERE scratch_event_id= $2 RETURNING image",
                            values: [
                                s3Path,
                                result[0].scratch_event_id
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

        let _scratch_event_id = req.body.scratch_event_id ? req.body.scratch_event_id : null;
        let _status = req.body.status ? req.body.status : null;
        //let _banner_type = req.body.banner_type ? req.body.banner_type : null;
        let _orderBy = req.body.orderBy ? req.body.orderBy : 'name';

        let _selectQuery = 'SELECT * FROM tbl_scratch_event_master WHERE  1=1'

        if (_scratch_event_id) {
            _selectQuery += " AND scratch_event_id = " + _scratch_event_id
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