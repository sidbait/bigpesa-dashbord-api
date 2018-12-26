const pgConnection = require('../../model/pgConnection');

const services = require('../../service/service');

const customMsgType = "MASTER_MESSAGE";
const customMsgTypeCM = "COMMON_MESSAGE";

module.exports = {

    getAll: async function (req, res) {

        let _selectQuery = "SELECT * FROM tbl_event_master"
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
            "eventname": 'required',
            "eventtype": 'required',
            "bonusamount": 'required',
            "credittype": 'required',
            "bonustoplayer": 'required',
            "credittypetoplayer": 'required'
        };

        let validation = new services.validator(req.body, rules);

        if (validation.passes()) {

            let _eventid = req.body.eventid ? req.body.eventid : null;
            let _appid = req.body.appid ? req.body.appid : null;
            let _eventname = req.body.eventname ? req.body.eventname : null;
            let _eventtype = req.body.eventtype ? req.body.eventtype : null;
            let _eventdesc = req.body.eventdesc ? req.body.eventdesc : null;
            let _bonusamount = req.body.bonusamount ? req.body.bonusamount : null;
            let _isrepeat = req.body.isrepeat ? req.body.isrepeat : false;
            let _repeatcount = req.body.repeatcount ? req.body.repeatcount : null;
            let _status = req.body.status ? req.body.status : 'DE-ACTIVE';
            let _createdby = null;
            let _createdat = 'now()'
            let _updatedby = null;
            let _updatedat = 'now()'
            let _credittype = req.body.credittype ? req.body.credittype : false;
            let _bonustoplayer = req.body.bonustoplayer ? req.body.bonustoplayer : false;
            let _credittypetoplayer = req.body.credittypetoplayer ? req.body.credittypetoplayer : false;

            let queryText, valuesArr;
            let errMsgType = _eventid ? 'UPDATE_FAILED' : 'FAILED_REGISTERED'
            let successMsgType = _eventid ? 'UPDATE_SUCCESS' : 'REGISTERED_SUCCESS'

            if (!_eventid) {

                queryText = "INSERT INTO tbl_event_master (app_id,event_name,event_type,event_desc,bonus_amount,is_repeat,repeat_count,status,created_by,created_at,updated_by,credit_type,bonus_toplayer,credit_type_toplayer) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW(),$10,$11,$12,$13) RETURNING *";

                valuesArr = [_appid, _eventname, _eventtype, _eventdesc, _bonusamount, _isrepeat, _repeatcount, _status, _createdby, _updatedby, _credittype, _bonustoplayer, _credittypetoplayer]

            }
            else {

                queryText = `UPDATE tbl_event_master
                            SET
                            app_id=$1,
                            event_name=$2,
                            event_type=$3,
                            event_desc=$4,
                            bonus_amount=$5,
                            is_repeat=$6,
                            repeat_count=$7,
                            status=$8,
                            updated_by=$9,
                            credit_type=$10,
                            bonus_toplayer=$11,
                            credit_type_toplayer=$12
                            WHERE event_id=$13
                            RETURNING *`;

                valuesArr = [_appid, _eventname, _eventtype, _eventdesc, _bonusamount, _isrepeat, _repeatcount, _status, _updatedby, _credittype, _bonustoplayer, _credittypetoplayer, _eventid]

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

        let _eventid = req.body.eventid ? req.body.eventid : null;
        let _appid = req.body.appid ? req.body.appid : null;
        let _eventname = req.body.eventname ? req.body.eventname : null;
        let _eventtype = req.body.eventtype ? req.body.eventtype : null;
        let _bonusamount = req.body.bonusamount ? req.body.bonusamount : null;
        let _isrepeat = req.body.isrepeat ? req.body.isrepeat : false;
        let _status = req.body.status ? req.body.status : null;
        let _credittype = req.body.credittype ? req.body.credittype : false;
        let _credittypetoplayer = req.body.credittypetoplayer ? req.body.credittypetoplayer : false;


        let _selectQuery = 'SELECT * FROM tbl_event_master'

        if (_eventid) {
            _selectQuery += " WHERE event_id = " + _eventid
        }

        if (_appid) {
            _selectQuery += _eventid ? ' AND ' : ' WHERE '
            _selectQuery += " status = '" + _appid + "'"
        }

        if (_eventname) {
            _selectQuery += (_eventid || _appid) ? ' AND ' : ' WHERE '
            _selectQuery += " event_name LIKE '%" + _eventname + "%'"
        }

        if (_eventtype) {
            _selectQuery += (_eventid || _appid || _eventname) ? ' AND ' : ' WHERE '
            _selectQuery += " event_type = '" + _eventtype + "'"
        }

        if (_bonusamount) {
            _selectQuery += (_eventid || _appid || _eventname || _eventtype) ? ' AND ' : ' WHERE '
            _selectQuery += " bonus_amount = '" + _bonusamount + "'"
        }

        if (_isrepeat) {
            _selectQuery += (_eventid || _appid || _eventname || _eventtype || _bonusamount) ? ' AND ' : ' WHERE '
            _selectQuery += " is_repeat = '" + _isrepeat + "'"
        }

        if (_status) {
            _selectQuery += (_eventid || _appid || _eventname || _eventtype || _bonusamount || _isrepeat) ? ' AND ' : ' WHERE '
            _selectQuery += " status = '" + _status + "'"
        }

        if (_credittype) {
            _selectQuery += (_eventid || _appid || _eventname || _eventtype || _bonusamount || _isrepeat || _status) ? ' AND ' : ' WHERE '
            _selectQuery += " credit_type = '" + _credittype + "'"
        }

        if (_credittypetoplayer) {
            _selectQuery += (_eventid || _appid || _eventname || _eventtype || _bonusamount || _isrepeat || _status || _credittype) ? ' AND ' : ' WHERE '
            _selectQuery += " credit_type_toplayer = '" + _credittypetoplayer + "'"
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