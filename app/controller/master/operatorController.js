const pgConnection = require('../../model/pgConnection');

const services = require('../../service/service');

const customMsgType = "MASTER_MESSAGE";
const customMsgTypeCM = "COMMON_MESSAGE";

module.exports = {
    getAll: async function (req, res) {

        let _selectQuery = "Select * From tbl_operator"

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
                "operator": 'required',
                "operatorcode" : 'required',
                "status": 'required'
            };

            var custom_message = {
                "required.operator": "Operator name is mandatory!",
                "required.operatorcode": "Operator code is mandatory!",
                "required.status": "Status is mandatory!",
            };

            let validation = new services.validator(req.body, rules, custom_message);

            if (validation.passes()) {

                let _operatorid = req.body.operatorid ? req.body.operatorid : null;
                let _operator = req.body.operator ? req.body.operator : null;
                let _operatorcode = req.body.operatorcode ? req.body.operatorcode : null;
                let _status = req.body.status ? req.body.status : null;
                let _userid = req.body.userid ? req.body.userid : null;
                let _apiChecksum = req.body.checksum;
                let _userToken = req.body.checksum;

                /*if (_operatorid == '' || _operatorid == undefined)
                    _operatorid = null;

                if (_userid == '' || _userid == undefined)
                    _userid = null;

                    let _checksum = _operatorid + '$' + _operator + '$' + _operatorcode + '$' + _status;

                    if (!services.validateCheckSum.validate(_checksum, _apiChecksum, _userToken)) {
                        services.sendResponse.sendCustomJSON(null, req, res, false, null,
                            'Invalid Checksum!.', 400);
                    }
                    else {*/
                        try {

                            let _query = {
                                    text : "Select * From fn_master_addupdateoperator($1,$2,$3,$4,$5)",
                                    values : [
                                        _operatorid,
                                        _operator,
                                        _operatorcode,
                                        _status,
                                        _userid
                                    ]
                                };
                                
                                let response = {
                                    _operatorid : null,
                                    _operator : null,
                                    _operatorcode   : null,
                                    _status : null
                                };

                            let result = await pgConnection.executeQuery('cms', _query)

                            if (result.length > 0) {
                                if (result[0].fn_master_addupdateoperator == undefined || result[0].fn_master_addupdateoperator == null) {
                                    services.sendResponse.sendWithCode(req, res, response, customMsgType, "ALREADY_REGISTERED");
                                }
                                else if (result[0].fn_master_addupdateoperator > 0) {
                                    response = {
                                        operatorid : result[0].fn_master_addupdatecountry,
                                        operator : _operator,
                                        operatorcode : _operatorcode,
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
           /* }
            else {
                services.sendResponse.sendCustomJSON(null, req, res, false, validation.errors.errors,
                    'Validation failed! Please provide the valid input details.', 400);
            }*/
    }
}
