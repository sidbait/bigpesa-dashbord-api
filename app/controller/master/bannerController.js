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

        let obj = req.body
        // deleting null value from req.body
        Object.keys(obj).forEach(k => (obj[k] === 'null') && delete obj[k]);

        let validation = new services.validator(req.body, rules);

        if (validation.passes()) {

            let _banner_id = req.body.banner_id ? req.body.banner_id : null;
            let _banner_name = req.body.banner_name ? req.body.banner_name : null;
            let _description = req.body.description ? req.body.description : null;
            // let _image_url = req.body.image_url ? req.body.image_url : null;
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
                    text: "INSERT INTO tbl_banner(banner_name,description,banner_type,app_id,contest_id,click_url,width,height,banner_priority,status,created_date,page,channel,start_date,end_date) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *",
                    values: [
                        _banner_name, _description, _banner_type, _app_id, _contest_id, _click_url, _width, _height, _banner_priority, _status, _created_date, _page, _channel, _new_start_date, _new_end_date
                    ]
                }
            }
            else {

                _query = {
                    text: "UPDATE tbl_banner SET banner_id=$1,banner_name=$2,description=$3,banner_type=$4,app_id=$5,contest_id=$6,click_url=$7,width=$8,height=$9,banner_priority=$10,status=$11,created_date=$12,page=$13,channel=$14, start_date=$16,end_date=$17 WHERE banner_id=$15 RETURNING *",
                    values: [
                        _banner_id, _banner_name, _description, _banner_type, _app_id, _contest_id, _click_url, _width, _height, _banner_priority, _status, _created_date, _page, _channel, _banner_id, _new_start_date, _new_end_date
                    ]
                }

            }

            try {

                let result = await pgConnection.executeQuery('rmg_dev_db', _query)


                if (result.length > 0) {

                    if (req.files != null && req.files.length > 0) {
                        // let movePath = await uploadBanner(req, result[0].contest_master_id);
                        let s3Path = await services.s3.upload(req, 'banners');
                        let mvQuery = {
                            text: "UPDATE tbl_banner set image_url = $1 WHERE banner_id= $2 RETURNING image_url",
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
        let _banner_type = req.body.banner_type ? req.body.banner_type : null;
        let _orderBy = req.body.orderBy ? req.body.orderBy : 'banner_name';

        let _selectQuery = 'SELECT * FROM tbl_banner WHERE  1=1'

        if (_banner_id) {
            _selectQuery += " AND banner_id = " + _banner_id
        }

        if (_status) {
            _selectQuery += " AND status = '" + _status + "'"
        }

        if (_banner_type) {
            _selectQuery += " AND banner_type = '" + _banner_type + "'"
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

    chgBannersOrder: async function (req, res) {
        // console.log(req.body);

        let bannersOrder = req.body.bannersOrder ? req.body.bannersOrder : null;

        let updateQueries = await getUpdateQuerie(bannersOrder);

        console.log(updateQueries);

        Promise.all(updateQueries.map(async (query) => {
            return await pgConnection.executeQuery('rmg_dev_db', query);
        })).then((inresults) => {
            // console.log(inresults);
            res.send({ "ok": inresults })
        })
        // res.send({ "ok": 'inresults' })
    },

}

function joinDateTime(date, time) {
    let new_date = date + 'T' + time + 'Z';
    return new_date
}

async function getUpdateQuerie(bannersOrder) {

    return new Promise((resolve, reject) => {
        let updateQuerie = []

        for (let i = 0; i < bannersOrder.length; i++) {
            const id = bannersOrder[i]
            const priority = i + 1;

            let _query = `update tbl_banner set banner_priority = ${priority} where banner_id = ${id} RETURNING banner_name,banner_priority`;

            updateQuerie.push(_query)
        }

        resolve(updateQuerie)
    });
}