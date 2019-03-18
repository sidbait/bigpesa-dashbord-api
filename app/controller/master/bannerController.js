const pgConnection = require('../../model/pgConnection');

const services = require('../../service/service');

const customMsgType = "MASTER_MESSAGE";
const customMsgTypeCM = "COMMON_MESSAGE";

module.exports = {

    getAll: async function (req, res) {

        let _selectQuery = "SELECT * FROM tbl_banner"
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
            // "banner_id": 'required|numeric',
            "banner_name": 'required',
            // "description": 'required',
            // "image_url": 'required',
            // "banner_type": 'required',
            // "app_id": 'required|numeric',
            // "contest_id": 'required|numeric',
            // "click_url": 'required',
            // "width": 'required|numeric',
            // "height": 'required',
            // "banner_priority": 'required',
            "status": 'required|in:ACTIVE,DEACTIVE,PENDING',
            // "created_date": 'required',
            // "page": 'required',
            // "channel": 'required',
        };

        let validation = new services.validator(req.body, rules);

        if (validation.passes()) {

            let _banner_id = req.body.banner_id ? req.body.banner_id : null;
            let _banner_name = req.body.banner_name ? req.body.banner_name : null;
            let _description = req.body.description ? req.body.description : null;
            let _image_url = req.body.image_url ? req.body.image_url : null;
            let _banner_type = req.body.banner_type ? req.body.banner_type : null;
            let _app_id = req.body.app_id ? req.body.app_id : null;
            let _contest_id = req.body.contest_id ? req.body.contest_id : null;
            let _click_url = req.body.click_url ? req.body.click_url : null;
            let _width = req.body.width ? req.body.width : null;
            let _height = req.body.height ? req.body.height : null;
            let _banner_priority = req.body.banner_priority ? req.body.banner_priority : null;
            let _status = req.body.status ? req.body.status : null;
            let _created_date = req.body.created_date ? req.body.created_date : null;
            let _page = req.body.page ? req.body.page : null;
            let _channel = req.body.channel ? req.body.channel : null;
            let _created_by = req.body.userid ? req.body.userid : null;
            let _updated_by = req.body.userid ? req.body.userid : null;

            let _query;
            let errMsgType = _banner_id ? 'UPDATE_FAILED' : 'ADD_FAILED'
            let successMsgType = _banner_id ? 'UPDATE_SUCCESS' : 'ADD_SUCCESS'

            if (!_banner_id) {

                _query = {
                    text: "INSERT INTO tbl_banner(banner_name,description,image_url,banner_type,app_id,contest_id,click_url,width,height,banner_priority,status,created_date,page,channel) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *",
                    values: [
                        _banner_name, _description, _image_url, _banner_type, _app_id, _contest_id, _click_url, _width, _height, _banner_priority, _status, _created_date, _page, _channel
                    ]
                }
            }
            else {

                _query = {
                    text: "UPDATE tbl_banner SET banner_id=$1,banner_name=$2,description=$3,image_url=$4,banner_type=$5,app_id=$6,contest_id=$7,click_url=$8,width=$9,height=$10,banner_priority=$11,status=$12,created_date=$13,page=$14,channel=$15 WHERE banner_id=$16 RETURNING *",
                    values: [
                        _banner_id, _banner_name, _description, _image_url, _banner_type, _app_id, _contest_id, _click_url, _width, _height, _banner_priority, _status, _created_date, _page, _channel, _banner_id
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
    },

    search: async function (req, res) {

        let _banner_id = req.body.banner_id ? req.body.banner_id : null;

        let _selectQuery = 'SELECT * FROM tbl_banner WHERE  1=1'

        if (_banner_id) {
            _selectQuery += " AND banner_id = " + _banner_id
        }

        // if (_status) {
        //     _selectQuery += " AND status = " + _status
        // }

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