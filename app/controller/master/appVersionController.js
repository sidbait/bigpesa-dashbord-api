const pgConnection = require('../../model/pgConnection');
const mv = require('mv');

const services = require('../../service/service');

const customMsgType = "MASTER_MESSAGE";
const customMsgTypeCM = "COMMON_MESSAGE";

module.exports = {

    getAll: async function (req, res) {

        let _selectQuery = "Select * From tbl_app_version"
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
            // "version_id": 'required|numeric',
            "app_id": 'required|numeric',
            "channel": 'required',
            "old_version": 'required',
            "new_version": 'required',
            "status": 'required|in:ACTIVE,DEACTIVE,PENDING',
            "download_url": 'required',
        };

        let validation = new services.validator(req.body, rules);

        if (validation.passes()) {

            let _version_id = req.body.version_id ? req.body.version_id : null;
            let _app_id = req.body.app_id ? req.body.app_id : null;
            let _channel = req.body.channel ? req.body.channel : null;
            let _old_version = req.body.old_version ? req.body.old_version : null;
            let _new_version = req.body.new_version ? req.body.new_version : null;
            let _status = req.body.status ? req.body.status : null;
            let _download_url = req.body.download_url ? req.body.download_url : null;
            let _created_by = req.body.userid ? req.body.userid : null;
            let _updated_by = req.body.userid ? req.body.userid : null;

            let _query;
            let errMsgType = _version_id ? 'UPDATE_FAILED' : 'ADD_FAILED'
            let successMsgType = _version_id ? 'UPDATE_SUCCESS' : 'ADD_SUCCESS'

            if (!_version_id) {

                _query = {
                    text: "INSERT INTO tbl_app_version(app_id,channel,old_version,new_version,status,download_url,created_by,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,now()) RETURNING *",
                    values: [
                         _app_id, _channel, _old_version, _new_version, _status, _download_url, _created_by
                    ]
                }
            }
            else {

                _query = {
                    text: "UPDATE tbl_app_version SET version_id=$1,app_id=$2,channel=$3,old_version=$4,new_version=$5,status=$6,download_url=$7,updated_by=$8,updated_at=now() WHERE version_id=$9 RETURNING *",
                    values: [
                        _version_id, _app_id, _channel, _old_version, _new_version, _status, _download_url, _updated_by, _version_id
                    ]
                }

            }

            try {

                let result = await pgConnection.executeQuery('rmg_dev_db', _query)


                if (result.length > 0) {
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

        let _version_id = req.body.version_id ? req.body.version_id : null;
        let _app_id = req.body.app_id ? req.body.app_id : null;
        let _channel = req.body.channel ? req.body.channel : null;
        let _old_version = req.body.old_version ? req.body.old_version : null;
        let _new_version = req.body.new_version ? req.body.new_version : null;
        let _status = req.body.status ? req.body.status : null;
        let _download_url = req.body.download_url ? req.body.download_url : null;

        let _selectQuery = 'SELECT * FROM tbl_app_version WHERE  1=1'

        if (_version_id) {
            _selectQuery += " AND version_id = " + _version_id
        }
        if (_app_id) {
            _selectQuery += " AND app_id = " + _app_id
        }
        if (_channel) {
            _selectQuery += " AND channel = " + _channel
        }
        if (_old_version) {
            _selectQuery += " AND old_version = " + _old_version
        }
        if (_new_version) {
            _selectQuery += " AND new_version = " + _new_version
        }
        if (_status) {
            _selectQuery += " AND status = " + _status
        }
        if (_download_url) {
            _selectQuery += " AND download_url = " + _download_url
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
