const pgConnection = require('../../model/pgConnection');

const services = require('../../service/service');

const customMsgType = "MASTER_MESSAGE";
const customMsgTypeCM = "COMMON_MESSAGE";

module.exports = {
    getAll: async function (req, res) {

        let _selectQuery = "Select * From tbl_country"
            try
            {
                let dbResult = await pgConnection.executeQuery('cms', _selectQuery)

                if(dbResult && dbResult.length >0) {
                    services.sendResponse.sendWithCode(req, res, dbResult, customMsgType, "GET_SUCCESS");
                }
                else
                    services.sendResponse.sendWithCode(req, res, dbResult, customMsgType, "GET_FAILED");
            }
            catch(error) {
                services.sendResponse.sendWithCode(req, res, error, customMsgTypeCM, "DB_ERROR");
            }
    },

    add: async function (req, res) {

        let rules = {
            "country": 'required',
            "countrycode": 'required',
            "status": 'required'
        };

        var custom_message = {
            "required.country": "Country name is mandatory!",
            "required.countrycode": "Country code is mandatory!",
            "required.status": "Status is mandatory!",
        };

        let validation = new services.validator(req.body, rules, custom_message);

        if (validation.passes()) {

            let _countryid = req.body.countryid ? req.body.countryid :null;
            let _country = req.body.country ? req.body.country : null;
            let _countrycode = req.body.countrycode ? req.body.countrycode :null;
            let _status = req.body.status ? req.body.status : null;
            let _userid = req.body.userid ? req.body.userid : null;
            let _apiChecksum = req.body.checksum;
            let _userToken = req.body.checksum;

            /*if (_countryid == '' || _countryid == undefined)
                _countryid = null;

            if (_userid == '' || _userid == undefined)
                _userid = null;

            let _checksum = _countryid + '$' + _country + '$' + _countrycode + '$' + _status

            if (!services.validateCheckSum.validate(_checksum, _apiChecksum, _userToken)) {
                //services.sendResponse.sendCustomJSON(null, req, res, false, null,'Invalid Checksum!.', 400);
                services.sendResponse.sendWithCode(req, res, response, customMsgTypeCM, "VALIDATION_FAILED");

            }
            else {*/
                
            try{

                let _query = {
                    text : "Select * From fn_master_addUpdateCountry($1,$2,$3,$4,$5)",
                    values : [ 
                        _countryid,
                        _country,
                        _countrycode,   
                        _status,
                        _userid
                    ]
                    };

                    let response = {
                        countryid : null,
                        country : null,
                        countrycode : null,
                        status : null
                    }

                    let result = await pgConnection.executeQuery('cms', _query)

                    if (result.length > 0) {
                        if (result[0].fn_master_addupdatecountry == undefined || result[0].fn_master_addupdatecountry == null) {
                           services.sendResponse.sendWithCode(req, res, response, customMsgType, "ALREADY_REGISTERED");
                        }
                        else if (result[0].fn_master_addupdatecountry > 0) {
                            response = {
                                countryid : result[0].fn_master_addupdatecountry,
                                country : _country,
                                countrycode : _countrycode,
                                status : _status
                            }
                            services.sendResponse.sendWithCode(req, res, response, customMsgType, "REGISTERED_SUCCESS");
                        }
                        else {
                            services.sendResponse.sendWithCode(req, res, response, customMsgType, "FAILED_REGISTERED");
                        }
                    }

                    
                }
                catch (error) {
                    services.sendResponse.sendWithCode(req, res, response, customMsgTypeCM, "DB_ERROR");
                }
            }
        /*}
        else {
            services.sendResponse.sendCustomJSON(null, req, res, false, validation.errors.errors,
                'Validation failed! Please provide the valid input details.', 400);
        }*/
    }
}