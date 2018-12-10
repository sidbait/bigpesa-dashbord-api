const pgConnection = require('../../model/pgConnection');

const services = require('../../service/service');

const customMsgType = "MASTER_MESSAGE";
const customMsgTypeCM = "COMMON_MESSAGE";

module.exports = {
    getAll: async function(req,res){

        try{
            let _selectQuery = "select * from tbl_menu"

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
                "menu": 'required',
                "navigateurl": 'required',
                "priority": 'required',
                "target": 'required',
                "parentid": 'required',
                "status": 'required'
            };

            var custom_message = {
                "required.menu": "Menu name is mandatory!",
                "required.navigateurl": "Navigateurl is mandatory!",
                "required.target": "Target is mandatory!",
                "required.status": "Status is mandatory!"
            };

            let validation = new services.validator(req.body, rules, custom_message);

            if (validation.passes()) {

                let _menuid = req.body.menuid ? req.body.menuid : null;
                let _menu = req.body.menu ? req.body.menu : null;
                let _navigateurl = req.body.navigateurl ? req.body.navigateurl : null;
                let _priority = req.body.priority ? req.body.priority : null;
                let _target = req.body.target ? req.body.target : null;
                let _parentid = req.body.parentid ? req.body.parentid : null;
                let _status = req.body.status ? req.body.status : null;
                let _userid = req.body.userid ? req.body.userid : null;
                let _apiChecksum = req.body.checksum;
                let _userToken = req.body.checksum;

                /*if (_menuid == '' || _menuid == undefined)
                    _menuid = null;

                if (_userid == '' || _userid == undefined)
                    _userid = null;

                    let _checksum = _menuid + '$' + _menu + '$' + _navigateurl + '$' + _target + '$' + _status;

                    if (!services.validateCheckSum.validate(_checksum, _apiChecksum, _userToken)) {
                        services.sendResponse.sendCustomJSON(null, req, res, false, null,
                            'Invalid Checksum!.', 400);
                    }
                    else {*/
                    
                    try {

                        let _query = {
                            text : "Select * From fn_master_addupdatemenu($1,$2,$3,$4,$5,$6,$7,$8)",
                            values : [
                                _menuid,
                                _menu,
                                _navigateurl,
                                _priority,
                                _target,
                                _parentid,
                                _status,
                                _userid
                            ]
                        };

                        let response = {
                            menuid : null,
                            menu : null,
                            navigateurl : null,
                            priority : null,
                            target : null,
                            parentid : null,
                            status : null
                        };

                        let result = await pgConnection.executeQuery('cms', _query)

                        if (result.length > 0) {
                            if (result[0].fn_master_addupdatemenu == undefined || result[0].fn_master_addupdatemenu == null) {
                                services.sendResponse.sendWithCode(req, res, response, customMsgType, "ALREADY_REGISTERED");
                            }
                            else if (result[0].fn_master_addupdatemenu > 0) {
                                response = {
                                    menuid : result[0].fn_master_addupdatecountry,
                                    menu : _menu,
                                    navigateurl : _navigateurl,
                                    priority : _priority,
                                    target : _target,
                                    parentid : _parentid,
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
