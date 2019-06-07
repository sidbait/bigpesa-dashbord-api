const pgConnection = require('../../model/pgConnection');

const services = require('../../service/service');

const customMsgType = "MASTER_MESSAGE";
const customMsgTypeCM = "COMMON_MESSAGE";

module.exports = {

    getAll: async function (req, res) {

        let _selectQuery = "SELECT * FROM tbl_scratch_winner_banners"
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
            "banner_name":'required',
            "status": 'required|in:ACTIVE,DEACTIVE,PENDING',
        };

        let obj = req.body
        // deleting null value from req.body
        Object.keys(obj).forEach(k => (obj[k] === 'null') && delete obj[k]);

        let validation = new services.validator(req.body, rules);

        if (validation.passes()) {

            let _banner_id = req.body.banner_id ? req.body.banner_id : null;
            let _player_id = req.body.player_id ? req.body.player_id : null;
            let _banner_name = req.body.banner_name ? req.body.banner_name : null;
            let _description = req.body.description ? req.body.description : null;
            let _click_url = req.body.click_url ? req.body.click_url : null;
            let _banner_priority = req.body.banner_priority ? req.body.banner_priority : null;
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
            let errMsgType = _banner_id ? 'UPDATE_FAILED' : 'ADD_FAILED'
            let successMsgType = _banner_id ? 'UPDATE_SUCCESS' : 'ADD_SUCCESS'

            if (!_banner_id) {

                _query = {
                    text: "INSERT INTO tbl_scratch_winner_banners(banner_name,description,click_url,banner_priority,from_date,to_date,player_id,status,created_by,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,now()) RETURNING banner_id",
                    values: [
                        _banner_name, _description, _click_url, _banner_priority, _new_start_date, _new_end_date, _player_id, _status, _created_by
                    ]
                }
            }
            else {

                _query = {
                    text: "UPDATE tbl_scratch_winner_banners SET banner_name=$1,description=$2,click_url=$3,banner_priority=$4,from_date=$5,to_date=$6,player_id=$7,status=$8,updated_by=$9,updated_at=now() WHERE banner_id=$10 RETURNING banner_id",
                    values: [
                        _banner_name, _description, _click_url, _banner_priority, _new_start_date, _new_end_date, _player_id, _status, _updated_by, _banner_id
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
                            text: "UPDATE tbl_scratch_winner_banners set image_url = $1 WHERE banner_id= $2 RETURNING image_url",
                            values: [
                                s3Path,
                                result[0].banner_id
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

        let _banner_id = req.body.banner_id ? req.body.banner_id : null;
        let _status = req.body.status ? req.body.status : null;
        //let _banner_type = req.body.banner_type ? req.body.banner_type : null;
        let _orderBy = req.body.orderBy ? req.body.orderBy : 'banner_name';

        let _selectQuery = 'SELECT * FROM tbl_scratch_winner_banners WHERE  1=1'

        if (_banner_id) {
            _selectQuery += " AND banner_id = " + _banner_id
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