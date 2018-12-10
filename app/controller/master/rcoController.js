const pgConnection = require('../../model/pgConnection');

const services = require('../../service/service');

const customMsgType = "MASTER_MESSAGE";
const customMsgTypeCM = "COMMON_MESSAGE";

module.exports = {
    getAll: async function(req,res){
        try{

            let _selectQuery = "select * from tbl_rco_mapping"

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
                "regionid": 'required',
                "countryid": 'required',
                "operatorid": 'required',
                "rcocode": 'required',
                "status": 'required'
            };

            var custom_message = {
                "required.regionid": "Region name is mandatory!",
                "required.countryid": "Country name is mandatory!",
                "required.operatorid": "Operator name is mandatory!",
                "required.rcocode": "RC code is mandatory!",
                "required.status": "Status is mandatory!"
            };

            let validation = new services.validator(req.body, rules, custom_message);

            if (validation.passes()) {

                let _rcoid = req.body.rcoid ? req.body.rcoid : null;
                let _regionid = req.body.regionid ? req.body.regionid : null;
                let _countryid = req.body.countryid ? req.body.countryid : null;
                let _operatorid = req.body.operatorid ? req.body.operatorid : null;
                let _rcocode = req.body.rcocode ? req.body.rcocode : null;
                let _status = req.body.status ? req.body.status : null;
                let _userid = req.body.userid ? req.body.userid : null;
                let _apiChecksum = req.body.checksum;
                let _userToken = req.body.checksum;

                /*if (_rcoid == '' || _rcoid == undefined)
                    _rcoid = null;

                if (_userid == '' || _userid == undefined)
                    _userid = null;

                let _checksum = _rcoid + '$' + _regionid + '$' + _countryid + '$' + _operatorid + '$' + _rcocode + '$' + _status;

                if (!services.validateCheckSum.validate(_checksum, _apiChecksum, _userToken)) {
                   services.sendResponse.sendCustomJSON(null, req, res, false, null,
                   'Invalid Checksum!.', 400);
                }
                else {*/

                    try {

                        let _query = {
                            text : "Select * From fn_master_addupdatercomapping($1,$2,$3,$4,$5,$6,$7)",
                            values : [
                                _rcoid,
                                _regionid,
                                _countryid,
                                _operatorid,
                                _rcocode,
                                _status,
                                _userid
                            ]
                        };
                        
                        let response = {
                            rcoid : null,
                            regionid : null,
                            countryid : null,
                            operatorid : null,
                            rcocode : null,
                            status : null
                        };

                        let result = await pgConnection.executeQuery('cms', _query)

                        if (result.length > 0) {
                            if (result[0].fn_master_addupdatercomapping == undefined || result[0].fn_master_addupdatercomapping == null) {
                                services.sendResponse.sendWithCode(req, res, response, customMsgType, "ALREADY_REGISTERED");
                            }
                            else if (result[0].fn_master_addupdatercomapping > 0) {
                                response = {
                                    rcoid : result[0].fn_master_addupdatecountry,
                                    regionid : _regionid,
                                    countryid : _countryid,
                                    operatorid : _operatorid,
                                    rcocode : _rcocode,
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