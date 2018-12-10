const pgConnection = require('../../model/pgConnection');

const services = require('../../service/service');

const customMsgType = "MASTER_MESSAGE";
const customMsgTypeCM = "COMMON_MESSAGE";

module.exports = {
    getAll: async function(req,res){
        let _selectQuery = "select * from tbl_language"

        try{

            let dbResult = await pgConnection.executeQuery('cms', _selectQuery)
            
            if(dbResult && dbResult.length >0) {
                services.sendResponse.sendWithCode(req, res, dbResult, customMsgType, "GET_SUCCESS");
            }
            else
                services.sendResponse.sendWithCode(req, res, dbResult, customMsgType, "GET_FAILED");
        }
        catch(error){
            services.sendResponse.sendWithCode(req, res, error, customMsgTypeCM, "DB_ERROR");
        }
    },

    add: async function (req, res) {

            let rules = {
                "language": 'required',
                "status": 'required'
            };

            var custom_message = {
                "required.language": "Language is mandatory!",
                "required.status": "Status is mandatory!",
            };

            let validation = new services.validator(req.body, rules, custom_message);

            if (validation.passes()) {

                let _languageid = req.body.languageid ? req.body.languageid : null;
                let _language = req.body.language ? req.body.language :null;
                let _status = req.body.status ? req.body.status : null;                
                let _userid = req.body.userid ? req.body.userid : null;
                let _apiChecksum = req.body.checksum;
                let _userToken = req.body.checksum;

                /*if (_languageid == '' || _languageid == undefined)
                    _languageid = null;

                if (_userid == '' || _userid == undefined)
                    _userid = null;

                    let _checksum = _languageid + '$' + _language + '$' + _status;

                    if (!services.validateCheckSum.validate(_checksum, _apiChecksum, _userToken)) {
                        services.sendResponse.sendWithCode(req, res, response, customMsgTypeCM, "VALIDATION_FAILED");
                    }
                    else {*/
                    
                    try {

                        let _query = { 
                                text : "Select * From fn_master_addupdatelanguage($1,$2,$3,$4)",
                                values : [
                                    _languageid,
                                    _language,
                                    _status,
                                    _userid
                                ]
                            };
                        
                            let response = {
                                _languageid : null,
                                _language : null,
                                _status : null
                            };

                        let result = await pgConnection.executeQuery('cms', _query)

                        if (result.length > 0) {
                            if (result[0].fn_master_addupdatelanguage == undefined || result[0].fn_master_addupdatelanguage == null) {
                                services.sendResponse.sendWithCode(req, res, response, customMsgType, "ALREADY_REGISTERED");
                            }
                            else if (result[0].fn_master_addupdatelanguage > 0) {
                                response = {
                                    languageid : result[0].fn_master_addupdatecountry,
                                    language : _language,
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
