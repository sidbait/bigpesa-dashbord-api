const pgConnection = require('../../model/pgConnection');
const mv = require('mv');
const services = require('../../service/service');

const customMsgType = "MASTER_MESSAGE";
const customMsgTypeCM = "COMMON_MESSAGE";

module.exports = {

    getAll: async function (req, res) {

        let _selectQuery = "SELECT * FROM tbl_dailybonus_spin_master"
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
            // "id": 'required|numeric',
            "spin_text": 'required',
            // "spin_img": 'required',
            "credit_type": 'required',
            "amount": 'required',
            // "isvalid": 'required|numeric',
            "status": 'required|in:ACTIVE,DEACTIVE,PENDING',
        };

        let validation = new services.validator(req.body, rules);

        if (validation.passes()) {

            let _id = req.body.id ? req.body.id : null;
            let _spin_text = req.body.spin_text ? req.body.spin_text : null;
            let _spin_img = req.body.spin_img ? req.body.spin_img : null;
            let _credit_type = req.body.credit_type ? req.body.credit_type : null;
            let _amount = req.body.amount ? req.body.amount : null;
            let _isvalid = req.body.isvalid ? req.body.isvalid : null;
            let _status = req.body.status ? req.body.status : null;
            let _created_by = req.body.userid ? req.body.userid : null;
            let _updated_by = req.body.userid ? req.body.userid : null;

            let _query;
            let errMsgType = _id ? 'UPDATE_FAILED' : 'ADD_FAILED'
            let successMsgType = _id ? 'UPDATE_SUCCESS' : 'ADD_SUCCESS'

            if (!_id) {

                _query = {
                    text: "INSERT INTO tbl_dailybonus_spin_master(spin_text,spin_img,credit_type,amount,isvalid,status,created_by,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,now()) RETURNING *",
                    values: [
                        _spin_text, _spin_img, _credit_type, _amount, _isvalid, _status, _created_by
                    ]
                }
            }
            else {

                _query = {
                    text: "UPDATE tbl_dailybonus_spin_master SET id=$1,spin_text=$2,spin_img=$3,credit_type=$4,amount=$5,isvalid=$6,status=$7,updated_by=$8,updated_at=now() WHERE id=$9 RETURNING *",
                    values: [
                        _id, _spin_text, _spin_img, _credit_type, _amount, _isvalid, _status, _updated_by, _id
                    ]
                }

            }

            try {

                let result = await pgConnection.executeQuery('rmg_dev_db', _query)

                if (result.length > 0) {

                    if (req.files != null && req.files.length > 0) {

                        let uploadFilepath = `./public/master/spin-wheel/`;

                        let movePath = await uploadBanner(req, uploadFilepath);

                        let mvQuery = {
                            text: "UPDATE tbl_dailybonus_spin_master set spin_img = $1 WHERE id= $2 RETURNING *",
                            values: [
                                movePath.replace('./public', ''),
                                result[0].id
                            ]
                        }

                        let mvResult = await pgConnection.executeQuery('rmg_dev_db', mvQuery)

                    }

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
        let _id = req.body.id ? req.body.id : null;
        let _spintext = req.body.spintext ? req.body.spintext : null;
        let _credittype = req.body.credittype ? req.body.credittype : null;
        let _status = req.body.status ? req.body.status : null;
        let _isvalid = req.body.isvalid ? req.body.isvalid : null;

        let _selectQuery = 'SELECT * FROM tbl_dailybonus_spin_master WHERE  1=1'

        if (_id) {
            _selectQuery += " AND id = " + _id
        }
        if (_spintext) {
            _selectQuery += " AND spintext = " + _spintext
        }
        if (_credittype) {
            _selectQuery += " AND credittype = " + _credittype
        }
        if (_status) {
            _selectQuery += " AND status = " + _status
        }
        if (_isvalid) {
            _selectQuery += " AND isvalid = " + _isvalid
        }

        try {
            let dbResult = await pgConnection.executeQuery('rmg_dev_db', _selectQuery)

            if (dbResult && dbResult.length > 0) {
                services.sendResponse.sendWithCode(req, res, dbResult, customMsgType, "GET_SUCCESS");
            } else {
                services.sendResponse.sendWithCode(req, res, dbResult, customMsgType, "GET_FAILED");
            }
        }
        catch (error) {
            services.sendResponse.sendWithCode(req, res, error, customMsgTypeCM, "DB_ERROR");
        }
    }

}

async function uploadBanner(req, uploadFilepath) {

    return new Promise((resolve, reject) => {

        let object = req.files;
        for (const key in object) {
            if (object.hasOwnProperty(key)) {

                const element = object[key];

                let fromPath = element.destination + element.filename;

                let extension = path.extname(fromPath)

                if (extension.toLowerCase() == ".jpg" ||
                    extension.toLowerCase() == ".jpeg" ||
                    extension.toLowerCase() == ".png" ||
                    extension.toLowerCase() == ".gif") {

                    let movePath = uploadFilepath + element.filename;
                    movePath = movePath.toLowerCase();

                    console.log("fromPath - " + fromPath + "\n" +
                        "extension - " + extension + "\n" +
                        "movePath - " + movePath + "\n"
                    );

                    mv(fromPath, movePath, { mkdirp: true }, function (err) {

                        if (err) {
                            
                            reject(err);
                        }
                        else
                            resolve(movePath)
                    });
                }
                else
                    reject("error - Invalid File Format")
            }
            else
                reject("error - hasOwnProperty error")
        }
    });
}