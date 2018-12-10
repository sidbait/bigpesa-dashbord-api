const pgConnection = require('../../model/pgConnection');

const services = require('../../service/service');

const customMsgType = "MASTER_MESSAGE";
const customMsgTypeCM = "COMMON_MESSAGE";

module.exports = {
    getAll: async function(req,res){

        try {

            let _selectQuery = "select * from tbl_region"

            let dbResult = await pgConnection.executeQuery('cms', _selectQuery);

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

    /*add: function(req,res){
        var rules = {
            "region": 'required',
            "regioncode": 'required',
            "status": 'required'
        };

        var validation = new services.validator(req.body, rules);

        if (validation.passes()) {

            var _regionid = req.body.regionid;
            var _region = req.body.region;
            var _regioncode = req.body.regioncode;
            var _status = req.body.status;
            var _userid = req.body.userid;

            if (_regionid == '' || _regionid == undefined)
                _regionid = null;

            if (_userid == '' || _userid == undefined)
                _userid = null;

            var _addQuery = "Select * From fn_master_addupdateregion(" + _regionid + ",'" + _region + "','" + _regioncode + "','" + _status + "'," + _userid + ")";

            if (config.debug_db_result) {
                console.log("Region | _addQuery | " + _addQuery);
            }

            pgConnection.executeQuery('cms', _addQuery)
            .then((result) => {
                //console.log(result,'xxx');
                
                if (result.length > 0) {
                    if (result[0].fn_master_addupdateregion == undefined || result[0].fn_master_addupdateregion == null) {
                        services.sendResponse.sendCustomJSON(null, result, req, res, false, { regionid: null },
                            'Details already exist! Please provide the unique details.');
                    }
                    else if (result[0].fn_master_addupdateregion > 0) {
                        services.sendResponse.sendCustomJSON(null, result, req, res, true, { regionid: result[0].fn_master_addupdateregion },
                            'Details saved successfully!');
                    }
                    else {
                        services.sendResponse.sendCustomJSON(null, result, req, res, false, { regionid: null },
                            'Failed to save details. Please try again.');
                    }
                }
            })
            .catch((error) => {
                //console.log('yyyy');
                
                services.sendResponse.sendDBResponse(error, null, req, res, "No details found!");
            })
        }
        else {
            services.sendResponse.sendCustomJSON(null, req, res, false, { error: validation.errors.errors },
                'Validation failed! Please provide the valid input details.');
                // res.send(validation.errors.errors)
        }
    }*/

    add: async function (req, res) {

            let rules = {
                "region": 'required',
                "regioncode": 'required',
                "status": 'required'
            };

            var custom_message = {
                "required.region": "Region name is mandatory!",
                "required.regioncode": "Region code is mandatory!",
                "required.status": "Status is mandatory!"
            };

            let validation = new services.validator(req.body, rules, custom_message);

            if (validation.passes()) {

                let _regionid = req.body.regionid ? req.body.regionid : null;
                let _region = req.body.region ? req.body.region : null;
                let _regioncode = req.body.regioncode ? req.body.regioncode : null;
                let _status = req.body.status ? req.body.status : null;
                let _userid = req.body.userid ? req.body.userid : null;
                let _apiChecksum = req.body.checksum;
                let _userToken = req.body.checksum;

                /*if (_regionid == '' || _regionid == undefined)
                    _regionid = null;

                if (_userid == '' || _userid == undefined)
                    _userid = null;


                let _checksum = _regionid + '$' + _region + '$' + _regioncode + '$' + _status;

                if (!services.validateCheckSum.validate(_checksum, _apiChecksum, _userToken)) {
                    services.sendResponse.sendCustomJSON(null, req, res, false, null,
                    'Invalid Checksum!.', 400);
                }
                else {*/

                    try {

                        let _query = {
                            text : "Select * From fn_master_addupdateregion($1,$2,$3,$4,$5)",
                            values : [
                                _regionid,
                                _region,
                                _regioncode,
                                _status,
                                _userid
                            ]
                        };

                        let response = {
                            regionid : null,
                            region : null,
                            regioncode : null,
                            status : null
                        };

                        let result = await pgConnection.executeQuery('cms', _query)

                        if (result.length > 0) {
                            if (result[0].fn_master_addupdateregion == undefined || result[0].fn_master_addupdateregion == null) {
                                services.sendResponse.sendWithCode(req, res, response, customMsgType, "ALREADY_REGISTERED");
                            }
                            else if (result[0].fn_master_addupdateregion > 0) {
                                response = {
                                    regionid : result[0].fn_master_addupdatecountry,
                                    region : _region,
                                    regioncode : _regioncode,
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
