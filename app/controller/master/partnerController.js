const pgConnection = require('../../model/pgConnection');

const services = require('../../service/service');

const customMsgType = "MASTER_MESSAGE";
const customMsgTypeCM = "COMMON_MESSAGE";

module.exports = {
    getAll: async function(req,res){
        let _selectQuery = "select * from tbl_partner";

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
                "partner": 'required',
                "companyname": 'required',
                "companylogo": 'required',
                "address": 'required',
                "contactperson": 'required',
                "contactnumber": 'required',
                "email": 'required',
                "status": 'required'
            };

            var custom_message = {
                "required.partner": "Partner name is mandatory!",
                "required.address": "Address is mandatory!",
                "required.contactperson": "Contact person is mandatory!",
                "required.contactnumber": "Contact number is mandatory!",
                "required.email": "Email ID is mandatory!",
                "required.status": "Status is mandatory!",
            };

            let validation = new services.validator(req.body, rules, custom_message);

            if (validation.passes()) {

                let _partnerid = req.body.partnerid ? req.body.partnerid : null;
                let _partner = req.body.partner ? req.body.partner : null;
                let _companyname = req.body.companyname ? req.body.companyname : null;
                let _companylogo = req.body.companylogo ? req.body.companylogo : null;
                let _address = req.body.address ? req.body.address : null;
                let _contactperson = req.body.contactperson ? req.body.contactperson : null;
                let _contactnumber = req.body.contactnumber ? req.body.contactnumber : null;
                let _email = req.body.email ? req.body.email : null;
                let _status = req.body.status ? req.body.status : null;
                let _userid = req.body.userid ? req.body.userid : null;
                let _apiChecksum = req.body.checksum;
                let _userToken = req.body.checksum;

                /*if (_partnerid == '' || _partnerid == undefined)
                    _partnerid = null;

                if (_userid == '' || _userid == undefined)
                    _userid = null;
                
                let _checksum = _partnerid + '$' + _partner + '$' + _address + '$' + _contactperson + '$' + _contactnumber + '$' + _email + '$' + _status;

                if (!services.validateCheckSum.validate(_checksum, _apiChecksum, _userToken)) {
                   services.sendResponse.sendCustomJSON(null, req, res, false, null,
                  'Invalid Checksum!.', 400);
                }
                else {*/
                    try {

                        let _query = { 
                            text : "Select * From fn_master_addupdatepartner($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",
                            values : [
                                _partnerid,
                                _partner,
                                _companyname,
                                _companylogo,
                                _address,
                                _contactperson,
                                _contactnumber,
                                _email,
                                _status,
                                _userid
                            ]
                        };

                        let response = {
                            _partnerid : null,
                            _partner : null,
                            _companyname : null,
                            _companylogo : null,
                            _address : null,
                            _contactperson : null,
                            _contactnumber : null,
                            _email : null,
                            _status : null
                        };

                        let result = await pgConnection.executeQuery('cms', _query)

                        if (result.length > 0) {
                            if (result[0].fn_master_addupdatepartner == undefined || result[0].fn_master_addupdatepartner == null) {
                                services.sendResponse.sendWithCode(req, res, response, customMsgType, "ALREADY_REGISTERED");
                            }
                            else if (result[0].fn_master_addupdatepartner > 0) {
                                response = {
                                    partnerid : result[0].fn_master_addupdatecountry,
                                    partner : _partner,
                                    companyname : _companyname,
                                    companylogo : _companylogo,
                                    address : _address,
                                    contactperson : _contactperson,
                                    contactnumber : _contactnumber,
                                    email : _email,
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
