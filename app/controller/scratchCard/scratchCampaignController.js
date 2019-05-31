const pgConnection = require('../../model/pgConnection');

const services = require('../../service/service');

const customMsgType = "MASTER_MESSAGE";
const customMsgTypeCM = "COMMON_MESSAGE";

module.exports = {

    getAll: async function (req, res) {

        let _selectQuery = "SELECT * FROM tbl_scratch_campaign_master";
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
            "camp_name": 'required',
            // "camp_description": 'required',
            // "camp_image": 'required',
            // "camp_icon": 'required',
            // "valid_from": 'required',
            // "valid_to": 'required',
            "status": 'required|in:ACTIVE,DEACTIVE,PENDING',
            // "channel": 'required',
        };

        let obj = req.body
        // deleting null value from req.body
        Object.keys(obj).forEach(k => (obj[k] === 'null') && delete obj[k]);

        let validation = new services.validator(req.body, rules);

        if (validation.passes()) {

            let _camp_id = req.body.camp_id ? req.body.camp_id : null;
            let _camp_name = req.body.camp_name ? req.body.camp_name : null;
            let _camp_description = req.body.camp_description ? req.body.camp_description : null;
            let _status = req.body.status ? req.body.status : null;
            let _channel = req.body.channel ? req.body.channel : null;
            let _created_by = req.body.userid ? req.body.userid : null;
            let _updated_by = req.body.userid ? req.body.userid : null;

            let _start_date = req.body.start_date ? req.body.start_date : null;
            let _end_date = req.body.end_date ? req.body.end_date : null;
            let _from_time = req.body.from_time ? req.body.from_time : null;
            let _to_time = req.body.to_time ? req.body.to_time : null;

            let _valid_from = joinDateTime(_start_date, _from_time);
            let _valid_to = joinDateTime(_end_date, _to_time);

            let _query;
            let errMsgType = _camp_id ? 'UPDATE_FAILED' : 'ADD_FAILED'
            let successMsgType = _camp_id ? 'UPDATE_SUCCESS' : 'ADD_SUCCESS'

            if (!_camp_id) {

                _query = {
                    text: "INSERT INTO tbl_scratch_campaign_master(camp_name,camp_description,valid_from,valid_to,status,channel,created_by,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,now()) RETURNING *",
                    values: [
                        _camp_name, _camp_description, _valid_from, _valid_to, _status, _channel, _created_by
                    ]
                }
            }
            else {

                _query = {
                    text: "UPDATE tbl_scratch_campaign_master SET camp_name=$1,camp_description=$2,valid_from=$3,valid_to=$4,status=$5,channel=$6,updated_by=$7,updated_at=now() WHERE camp_id=$8 RETURNING *",
                    values: [
                        _camp_name, _camp_description, _valid_from, _valid_to, _status, _channel, _updated_by, _camp_id
                    ]
                }

            }

            try {

                let result = await pgConnection.executeQuery('rmg_dev_db', _query)


                if (result.length > 0) {

                    if (req.files != null && req.files.length > 0) {
                        // let movePath = await uploadBanner(req, result[0].contest_master_id);
                        let s3Path = await services.s3.multiUpload(req, 'scratch_card_img');
                        console.log(s3Path);

                        for (const iterator of s3Path) {

                            if (iterator.fieldname == 'camp_icon') {
                                let mvQuery = {
                                    text: "UPDATE tbl_scratch_campaign_master set camp_icon = $1 WHERE camp_id= $2 RETURNING camp_image",
                                    values: [
                                        iterator.url,
                                        result[0].camp_id
                                    ]
                                }

                                let mvResult = await pgConnection.executeQuery('rmg_dev_db', mvQuery)

                                console.log(mvResult);
                            }

                            if (iterator.fieldname == 'camp_image') {
                                let mvQuery = {
                                    text: "UPDATE tbl_scratch_campaign_master set camp_image = $1 WHERE camp_id= $2 RETURNING camp_image",
                                    values: [
                                        iterator.url,
                                        result[0].camp_id
                                    ]
                                }

                                let mvResult = await pgConnection.executeQuery('rmg_dev_db', mvQuery)

                                console.log(mvResult);
                            }
                        }

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

        let _camp_id = req.body.camp_id ? req.body.camp_id : null;
        let _status = req.body.status ? req.body.status : null;
        //let _banner_type = req.body.banner_type ? req.body.banner_type : null;
        let _orderBy = req.body.orderBy ? req.body.orderBy : 'camp_name';

        let _selectQuery = 'SELECT * FROM tbl_scratch_campaign_master WHERE  1=1'

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

