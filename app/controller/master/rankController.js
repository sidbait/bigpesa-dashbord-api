const pgConnection = require('../../model/pgConnection');

const services = require('../../service/service');

const customMsgType = "MASTER_MESSAGE";
const customMsgTypeCM = "COMMON_MESSAGE";

module.exports = {

    getAll: async function (req, res) {

        let _selectQuery = "Select * From tbl_contest_rank_master"
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
            "contestmasterid": 'required',
            "rankname": 'required',
            "lowerrank": 'required',
            "upperrank": 'required',
            "prizeamount": 'required',
            "status": 'required',
            "credittype": 'required'
        };

        let validation = new services.validator(req.body, rules);

        if (validation.passes()) {

            let _contestrankmasterid = req.body.contestrankmasterid ? req.body.contestrankmasterid : null;
            let _contestmasterid = req.body.contestmasterid ? req.body.contestmasterid : null;
            let _rankname = req.body.rankname ? req.body.rankname : null;
            let _rankdesc = req.body.rankdesc ? req.body.rankdesc : null;
            let _lowerrank = req.body.lowerrank ? req.body.lowerrank : null;
            let _upperrank = req.body.upperrank ? req.body.upperrank : null;
            let _prizeamount = req.body.prizeamount ? req.body.prizeamount : null;
            let _status = req.body.status ? req.body.status : null;
            let _createdby = null;
            let _createdat = 'now()'
            let _updatedby = null;
            let _updatedat = 'now()'
            let _credittype = req.body.credittype ? req.body.credittype : null;

            let queryText, valuesArr;
            let errMsgType = _appid ? 'UPDATE_FAILED' : 'FAILED_REGISTERED'
            let successMsgType = _appid ? 'UPDATE_SUCCESS' : 'REGISTERED_SUCCESS'

            if (!_appid) {

                queryText = "INSERT INTO tbl_contest_rank_master (app_name,app_secret,app_code,privacy_policy,term_condition,app_icon,status,created_by,created_at,updated_by,updated_at,callback_url,ios_app_url,android_app_url,deep_link,web_url,app_priority,app_type,package_name,filename,send_params) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),$9, NOW(),$10,$11,$12,$13,$14,$15,$16,$17,$18,$19) RETURNING *";

                valuesArr = [_appname, _appsecret, _appcode, _privacypolicy, _termscondition, _appicon, _status, _createdby, _updatedby, _callbackurl, _iosappurl, _androidappurl, _deeplink, _weburl, _apppriority, _apptype, _packagename, _filename, _sendparams]

            }
            else {

                queryText = `UPDATE tbl_contest_rank_master
                            SET
                            app_name=$1,
                            app_secret=$2,
                            app_code=$3,
                            privacy_policy=$4,
                            term_condition=$5,
                            app_icon=$6,
                            status=$7,
                            updated_by=$8,
                            updated_at=NOW(),
                            callback_url=$9,
                            ios_app_url=$10,
                            android_app_url=$11,
                            deep_link=$12,
                            web_url=$13,
                            app_priority=$14,
                            app_type=$15,
                            package_name=$16,
                            filename=$17,
                            send_params=$18
                            WHERE app_id=$19
                            RETURNING *`;

                valuesArr = [_appname, _appsecret, _appcode, _privacypolicy, _termscondition, _appicon, _status, _updatedby, _callbackurl, _iosappurl, _androidappurl, _deeplink, _weburl, _apppriority, _apptype, _packagename, _filename, _sendparams, _appid]

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

                    /*  if (result[0][Object.keys(result[0])[0]] == 'Insert') {
 
                         response = {
                             appid : result[0]
                         }
                         services.sendResponse.sendWithCode(req, res, response, customMsgType, "REGISTERED_SUCCESS");       
                     }
                     if (result[0].fn_master_addupdatecountry == undefined || result[0].fn_master_addupdatecountry == null) {
                         services.sendResponse.sendWithCode(req, res, response, customMsgType, "ALREADY_REGISTERED");
                     }
                     else if (result[0].fn_master_addupdatecountry > 0) {
                         response = {
                             countryid: result[0].fn_master_addupdatecountry,
                             country: _country,
                             countrycode: _countrycode,
                             status: _status
                         }
                         services.sendResponse.sendWithCode(req, res, response, customMsgType, "REGISTERED_SUCCESS");
                     }
                     else {
                         services.sendResponse.sendWithCode(req, res, response, customMsgType, "FAILED_REGISTERED");
                     } */
                } else {
                    console.log('len', result.length)
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

        let _appid = req.body.appid ? req.body.appid : null;
        let _appname = req.body.appname ? req.body.appname : null;
        let _status = req.body.status ? req.body.status : null;
        let _apptype = req.body.apptype ? req.body.apptype : null;

        let _selectQuery = 'Select * From tbl_contest_rank_master'

        if (_appid) {
            _selectQuery += " where app_id = " + _appid
        }

        if (_appname) {
            _selectQuery += _appid ? ' and ' : ' where '
            _selectQuery += " app_name = '" + _appname + "'"
        }

        if (_status) {
            _selectQuery += (_appid || _appname) ? ' and ' : ' where '
            _selectQuery += " status = '" + _status + "'"
        }

        if (_apptype) {
            _selectQuery += (_appid || _appname || _status) ? ' and ' : ' where '
            _selectQuery += " app_type = '" + _apptype + "'"
        }


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