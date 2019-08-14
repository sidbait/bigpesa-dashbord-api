const pgConnection = require('../../model/pgConnection');

const services = require('../../service/service');

const customMsgType = "MASTER_MESSAGE";
const customMsgTypeCM = "COMMON_MESSAGE";

module.exports = {

    add: async function (req, res) {

        let rules = {
            "me_id": 'required',
            "mt_id": 'required',
            "base_type": 'required',
            "from_date": 'required',
            "to_date": 'required',
            "from_time": 'required',
            "to_time": 'required',
            "status": 'required|in:ACTIVE,DEACTIVE,PENDING',
        };

        let obj = req.body
        console.log(req.body);

        // deleting null value from req.body
        Object.keys(obj).forEach(k => (obj[k] === 'null') && delete obj[k]);

        let validation = new services.validator(req.body, rules);

        if (validation.passes()) {

            let _schedule_id = req.body.schedule_id ? req.body.schedule_id : null;
            let _me_id = req.body.me_id ? req.body.me_id : null;
            let _mt_id = req.body.mt_id ? req.body.mt_id : null;
            let _base_type = req.body.base_type ? req.body.base_type : null;
            let _from_date = req.body.from_date ? req.body.from_date : null;
            let _to_date = req.body.to_date ? req.body.to_date : null;
            let _from_time = req.body.from_time ? req.body.from_time : null;
            let _to_time = req.body.to_time ? req.body.to_time : null;
            let _is_repeat = req.body.is_repeat ? req.body.is_repeat : false;
            let _daily_frequecny = req.body.daily_frequecny ? req.body.daily_frequecny : 0;
            let _fixed_base = req.body.fixed_base ? req.body.fixed_base : false;
            let _date_range = req.body.date_range ? req.body.date_range : null;
            let _pastdays = req.body.pastdays ? req.body.pastdays : 0;
            let _base_from_date = req.body.base_from_date ? req.body.base_from_date : null;
            let _base_to_date = req.body.base_to_date ? req.body.base_to_date : null;

            let _created_by = req.body.userid ? req.body.userid : null;
            let _updated_by = req.body.userid ? req.body.userid : null;
            let _status = req.body.status ? req.body.status : null;

            let _query;
            let errMsgType = _schedule_id ? 'UPDATE_FAILED' : 'ADD_FAILED'
            let successMsgType = _schedule_id ? 'UPDATE_SUCCESS' : 'ADD_SUCCESS'

            _daily_frequecny = _is_repeat ? _daily_frequecny : 0;

            if (_date_range == 'past') {
                _base_from_date = null;
                _base_to_date = null;
            } else if (_date_range == 'between') {
                _pastdays = 0;
            }

            if (!_schedule_id) {

                _query = {
                    text: "INSERT INTO tbl_message_schedule(me_id,mt_id,base_type,from_date,to_date,from_time,to_time,next_send_date,daily_frequecny,is_repeat,fixed_base,status,created_by,  created_at,date_range,base_from_date,base_to_date,pastdays) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,now(),$14,$15,$16,$17) RETURNING schedule_id",
                    values: [
                        _me_id, _mt_id, _base_type, _from_date, _to_date, _from_time, _to_time, _from_date, _daily_frequecny, _is_repeat, _fixed_base, _status, _created_by, _date_range, _base_from_date, _base_to_date, _pastdays
                    ]
                }
            }
            else {

                _query = {
                    text: "UPDATE tbl_message_schedule SET me_id=$1,mt_id=$2,base_type=$3,from_date=$4,to_date=$5,from_time=$6,to_time=$7,next_send_date=$8,daily_frequecny=$9,is_repeat=$10,fixed_base=$11,status=$12,updated_at=now(),updated_by=$13, date_range=$14,base_from_date=$15,base_to_date=$16,pastdays=$17 where schedule_id=$18 RETURNING schedule_id",
                    values: [
                        _me_id, _mt_id, _base_type, _from_date, _to_date, _from_time, _to_time, _from_date, _daily_frequecny, _is_repeat, _fixed_base, _status, _updated_by, _date_range, _base_from_date, _base_to_date, _pastdays, _schedule_id
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

        let _schedule_id = req.body.schedule_id ? req.body.schedule_id : null;
        let _me_id = req.body.me_id ? req.body.me_id : null;
        let _mt_id = req.body.mt_id ? req.body.mt_id : null;
        let _base_type = req.body.base_type ? req.body.base_type : null;
        let _from_date = req.body.from_date ? req.body.from_date : null;
        let _to_date = req.body.to_date ? req.body.to_date : null;
        let _from_time = req.body.from_time ? req.body.from_time : null;
        let _to_time = req.body.to_time ? req.body.to_time : null;
        let _is_repeat = req.body.is_repeat ? req.body.is_repeat : false;
        let _fixed_base = req.body.fixed_base ? req.body.fixed_base : false;
        let _status = req.body.status ? req.body.status : null;
        let _orderBy = req.body.orderBy ? req.body.orderBy : 'next_send_date';

        let _selectQuery = `SELECT schedule_id,tbl_message_schedule.me_id,event_name,tbl_message_schedule.mt_id,message,base_type,from_date::date::text,to_date::date::text,from_time,to_time,next_send_date::date::text, daily_frequecny,is_repeat,fixed_base,date_range, base_from_date,base_to_date,pastdays, tbl_message_schedule.status  FROM tbl_message_schedule
        inner join tbl_message_templates
        on tbl_message_templates.mt_id = tbl_message_schedule.mt_id
        inner join tbl_message_event
        on tbl_message_event.me_id = tbl_message_schedule.me_id
        WHERE  1=1`

        if (_schedule_id) {
            _selectQuery += " AND schedule_id = " + _schedule_id
        }

        if (_me_id) {
            _selectQuery += " AND tbl_message_schedule.me_id = " + _me_id
        }

        if (_mt_id) {
            _selectQuery += " AND tbl_message_schedule.mt_id = " + _mt_id
        }

        if (_base_type) {
            _selectQuery += " AND base_type = " + _base_type
        }

        if (_from_date) {
            _selectQuery += " AND from_date = " + _from_date
        }

        if (_to_date) {
            _selectQuery += " AND to_date = " + _to_date
        }

        if (_from_time) {
            _selectQuery += " AND from_time = " + _from_time
        }

        if (_to_time) {
            _selectQuery += " AND to_time = " + _to_time
        }

        if (_is_repeat) {
            _selectQuery += " AND is_repeat = " + _is_repeat
        }

        if (_fixed_base) {
            _selectQuery += " AND fixed_base = " + _fixed_base
        }

        if (_status) {
            _selectQuery += " AND tbl_message_schedule.status = '" + _status + "'"
        }

        _selectQuery += " order by " + _orderBy + " desc";

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