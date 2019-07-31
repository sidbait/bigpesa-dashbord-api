const pgConnection = require('../../model/pgConnection');
const services = require('../../service/service');

const customMsgType = "MASTER_MESSAGE";
const customMsgTypeCM = "COMMON_MESSAGE";

module.exports = {


    search: async function (req, res) {

        let id = req.body.id;

        let _selectQuery = 'select * from tbl_popup_master where 1=1'

        if (id) {
            _selectQuery += ` AND id = '${id}'`
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
    },

    add: async (req, res) => {
        let rules = {
            "title": 'required',
            // "popup_type": 'required',
            // "msg": 'required',
            // "description": 'required',
            // "img_url": 'required',
            // "show_count": 'required',
            // "from_date": 'required',
            // "to_date": 'required',
            // "repeat_time_diff_min": 'required',
            // "show_to_group": 'required',
            // "popup_segment": 'required',
            "status": 'required|in:ACTIVE,DEACTIVE,PENDING',
        };

        let validation = new services.validator(req.body, rules);

        if (validation.passes()) {

            let _id = req.body.id ? req.body.id : null;
            let _title = req.body.title ? req.body.title : null;
            let _popup_type = req.body.popup_type ? req.body.popup_type : null;
            let _msg = req.body.msg ? req.body.msg : null;
            let _description = req.body.description ? req.body.description : null;

            let _show_count = req.body.show_count ? req.body.show_count : null;

            let _start_date = req.body.start_date ? req.body.start_date : null;
            let _end_date = req.body.end_date ? req.body.end_date : null;
            let _from_time = req.body.from_time ? req.body.from_time : null;
            let _to_time = req.body.to_time ? req.body.to_time : null;

            let _from_date = joinDateTime(_start_date, _from_time);
            let _to_date = joinDateTime(_end_date, _to_time);

            let _repeat_time_diff_min = req.body.repeat_time_diff_min ? req.body.repeat_time_diff_min : null;
            let _show_to_group = req.body.show_to_group ? req.body.show_to_group : null;
            let _popup_segment = req.body.popup_segment ? req.body.popup_segment : null;
            let _status = req.body.status ? req.body.status : null;
            let _created_by = req.body.userid ? req.body.userid : null;
            let _updated_by = req.body.userid ? req.body.userid : null;

            let _query;
            let errMsgType = _id ? 'UPDATE_FAILED' : 'ADD_FAILED'
            let successMsgType = _id ? 'UPDATE_SUCCESS' : 'ADD_SUCCESS'

            if (!_id) {

                _query = {
                    text: "INSERT INTO tbl_popup_master(title,popup_type,msg,description,show_count,from_date,to_date,repeat_time_diff_min,show_to_group,popup_segment,status,created_by,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,now()) RETURNING *",
                    values: [
                        _title, _popup_type, _msg, _description, _show_count, _from_date, _to_date, _repeat_time_diff_min, _show_to_group, _popup_segment, _status, _created_by
                    ]
                }
            }
            else {

                _query = {
                    text: "UPDATE tbl_popup_master SET title=$1,popup_type=$2,msg=$3,description=$4,show_count=$5,from_date=$6,to_date=$7,repeat_time_diff_min=$8,show_to_group=$9,popup_segment=$10,status=$11,updated_by=$12,updated_at=now() WHERE id=$13 RETURNING *",
                    values: [
                        _title, _popup_type, _msg, _description, _show_count, _from_date, _to_date, _repeat_time_diff_min, _show_to_group, _popup_segment, _status, _updated_by, _id
                    ]
                }

            }

            try {

                let result = await pgConnection.executeQuery('rmg_dev_db', _query)


                if (result.length > 0) {
                    if (req.files != null && req.files.length > 0) {

                        let s3Path = await services.s3.multiUpload(req, 'pop_up');

                        for (const iterator of s3Path) {

                            if (iterator.fieldname == 'img_url') {
                                let mvQuery = {
                                    text: "UPDATE tbl_popup_master set img_url = $1 WHERE id = $2 RETURNING img_url",
                                    values: [
                                        iterator.url,
                                        result[0].id
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

    }

}


function joinDateTime(date, time) {
    let new_date = date + 'T' + time + 'Z';
    return new_date
}