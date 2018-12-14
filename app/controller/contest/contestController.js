const pgConnection = require('../../model/pgConnection');

const services = require('../../service/service');

const customMsgType = "MASTER_MESSAGE";
const customMsgTypeCM = "COMMON_MESSAGE";

module.exports = {

    getAll: async function (req, res) {

        let _selectQuery = "SELECT * FROM tbl_contest ORDER BY 1 DESC LIMIT 10"
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
            "appid": 'required',
            "contestname": 'required',
            "contesttype": 'required',
            "startdate": 'required|date',
            "enddate": 'required|date',
            "fromtime": 'required|time',
            "totime": 'required|time',
            "maxplayers": 'required',
            "winners": 'required',
            "entryfee": 'required',
            "currency": 'required',
            "profitmargin": 'required',
            "nextstartdate": 'required',
            "status": 'required',
            "contestmasterid": 'required',
            "debittype": 'required',
            "credittype": 'required',
            "winamount": 'required',
        };

        let validation = new services.validator(req.body, rules);

        if (validation.passes()) {

            let _contestid = req.body.contestid ? req.body.contestid : null;
            let _appid = req.body.appid ? req.body.appid : null;
            let _contestname = req.body.contestname ? req.body.contestname : null;
            let _contesttype = req.body.contesttype ? req.body.contesttype : null;
            let _contestdesc = req.body.contestdesc ? req.body.contestdesc : null;
            let _startdate = req.body.startdate ? req.body.startdate : null;
            let _enddate = req.body.enddate ? req.body.enddate : null;
            let _fromtime = req.body.fromtime ? req.body.fromtime : null;
            let _totime = req.body.totime ? req.body.totime : null;
            let _maxplayers = req.body.maxplayers ? req.body.maxplayers : null;
            let _winners = req.body.winners ? req.body.winners : null;
            let _entryfee = req.body.entryfee ? req.body.entryfee : null;
            let _currency = req.body.currency ? req.body.currency : null;
            let _profitmargin = req.body.profitmargin ? req.body.profitmargin : null;
            let _nextstartdate = req.body.nextstartdate ? req.body.nextstartdate : null;
            let _status = req.body.status ? req.body.status : null;
            let _createdby = null;
            let _updatedby = null;
            let _contestmasterid = req.body.contestmasterid ? req.body.contestmasterid : null;
            let _debittype = req.body.debittype ? req.body.debittype : null;
            let _credittype = req.body.credittype ? req.body.credittype : null;
            let _winamount = req.body.winamount ? req.body.winamount : null;
            let _cssclass = req.body.cssclass ? req.body.cssclass : null;


            let queryText, valuesArr;
            let errMsgType = _contestid ? 'UPDATE_FAILED' : 'FAILED_REGISTERED'
            let successMsgType = _contestid ? 'UPDATE_SUCCESS' : 'REGISTERED_SUCCESS'

            if (!_contestid) {

                queryText = "INSERT INTO tbl_contest (app_id,contest_name,contest_type,contest_desc,start_date,end_date,from_time,to_time,max_players,winners,entry_fee,currency,profit_margin,next_start_date,status,created_by,created_at,updated_by,updated_at,contest_master_id,debit_type,credit_type,win_amount,css_class) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,NOW(),$17,NOW(),$18,$19,$20,$21,$22) RETURNING *";

                valuesArr = [_appid, _contestname, _contesttype, _contestdesc, _startdate, _enddate, _fromtime, _totime, _maxplayers, _winners, _entryfee, _currency, _profitmargin, _nextstartdate, _status, _createdby, _updatedby, _contestmasterid, _debittype, _credittype, _winamount, _cssclass]

            }
            else {

                queryText = `UPDATE tbl_contest
                            SET
                            app_id=$1,
                            contest_name=$2,
                            contest_type=$3,
                            contest_desc=$4,
                            start_date=$5,
                            end_date=$6,
                            from_time=$7,
                            to_time=$8,
                            max_players=$9,
                            winners=$10,
                            entry_fee=$11,
                            currency=$12,
                            profit_margin=$13,
                            next_start_date=$14,
                            status=$15,
                            updated_by=16$,
                            updated_at=NOW(),
                            contest_master_id=$17,
                            debit_type=$18,
                            credit_type=$19,
                            win_amount=$20,
                            css_class=21$
                            WHERE app_id=$22
                            RETURNING *`;

                valuesArr = [_appid, _contestname, _contesttype, _contestdesc, _startdate, _enddate, _fromtime, _totime, _maxplayers, _winners, _entryfee, _currency, _profitmargin, _nextstartdate, _status, _updatedby, _contestmasterid, _debittype, _credittype, _winamount, _cssclass, _contestid]

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

        let _contestid = req.body.contestid ? req.body.contestid : null;
        let _appid = req.body.appid ? req.body.appid : null;
        let _contestname = req.body.contestname ? req.body.contestname : null;
        let _startdate = req.body.startdate ? req.body.startdate : null;
        let _enddate = req.body.enddate ? req.body.enddate : null;
        let _status = req.body.status ? req.body.status : null;

        let _selectQuery = 'SELECT * FROM tbl_contest'

        if (_contestid) {
            _selectQuery += " WHERE contest_id = " + _contestid
        }

        if (_appid) {
            _selectQuery += _contestid ? ' AND ' : ' WHERE '
            _selectQuery += " app_id = '" + _appid + "'"
        }

        if (_contestname) {
            _selectQuery += (_contestid || _appid) ? ' AND ' : ' WHERE '
            _selectQuery += " contest_name = '" + _contestname + "'"
        }

        if (_status) {
            _selectQuery += (_contestid || _appid || _contestname) ? ' AND ' : ' WHERE '
            _selectQuery += " status = '" + _status + "'"
        }

       /*  if(_startdate && _enddate){
            _selectQuery += (_contestid || _appid || _status) ? ' AND ' : ' WHERE '
            _selectQuery += " status = '" + _status + "'"
        } */

        _selectQuery += 'LIMIT 10'


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
    }

}