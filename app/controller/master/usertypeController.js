const pgConnection = require('../../model/pgConnection');

const services = require('../../service/service');

const customMsgType = "MASTER_MESSAGE";
const customMsgTypeCM = "COMMON_MESSAGE";

module.exports = {
    getAll: async function(req,res){
        try {

            let _selectQuery = "select * from tbl_usertype"

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
                "usertype": 'required',
                "status": 'required'
            };

            var custom_message = {
                "required.usertype": "User type is mandatory!",
                "required.status": "Status is mandatory!"
            };

            let validation = new services.validator(req.body, rules,custom_message);

            if (validation.passes()) {

                let _usertypeid = req.body.usertypeid ? req.body.usertypeid : null;
                let _usertype = req.body.usertype ? req.body.usertype : null;
                let _status = req.body.status ? req.body.status : null;
                let _userid = req.body.userid ? req.body.userid : null;
                let _apiChecksum = req.body.checksum;
                let _userToken = req.body.checksum;

                /*if (_usertypeid == '' || _usertypeid == undefined)
                    _usertypeid = null;

                if (_userid == '' || _userid == undefined)
                    _userid = null;

                let _checksum = _usertypeid + '$' + _usertype + '$' + _status;

                if (!services.validateCheckSum.validate(_checksum, _apiChecksum, _userToken)) {
                   services.sendResponse.sendCustomJSON(null, req, res, false, null,
                   'Invalid Checksum!.', 400);
                }
                else {*/

                    try {

                        let _query = {
                            text : "Select * From fn_master_addupdateusertype($1,$2,$3,$4)",
                            values : [
                                _usertypeid,
                                _usertype,
                                _status,
                                _userid
                            ]
                        };

                        let response = {
                            usertypeid : null,
                            usertype : null,
                            status : null
                        };
                    

                        let result = await pgConnection.executeQuery('cms', _query)

                        if (result.length > 0) {
                            if (result[0].fn_master_addupdateusertype == undefined || result[0].fn_master_addupdateusertype == null) {
                                services.sendResponse.sendWithCode(req, res, response, customMsgType, "ALREADY_REGISTERED");
                            }
                            else if (result[0].fn_master_addupdateusertype > 0) {
                                response = {
                                    usertypeid : result[0].fn_master_addupdatecountry,
                                    usertype : _usertype,
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
