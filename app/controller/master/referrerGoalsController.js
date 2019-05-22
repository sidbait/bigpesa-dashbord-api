const pgConnection = require('../../model/pgConnection');

const services = require('../../service/service');

const customMsgType = "MASTER_MESSAGE";
const customMsgTypeCM = "COMMON_MESSAGE";

module.exports = {

    getAll: async function (req, res) {

        let _selectQuery = "SELECT * FROM tbl_referrer_goals"
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
            "goal_name": 'required',
            "goal_value": 'required',
            // "goal_description": 'required',
            "reward_amount": 'required',
            "goal_achieved": 'required',
            // "goal_achieved_from ": 'required',
            "goal_achieved_to": 'required',
            "status": 'required|in:ACTIVE,DEACTIVE,PENDING',
        };

        let validation = new services.validator(req.body, rules);

        if (validation.passes()) {

            let _rg_id = req.body.rg_id ? req.body.rg_id : null;
            let _goal_name = req.body.goal_name ? req.body.goal_name : null;
            let _goal_value = req.body.goal_value ? req.body.goal_value : null;
            let _goal_description = req.body.goal_description ? req.body.goal_description : null;
            let _reward_amount = req.body.reward_amount ? req.body.reward_amount : null;
            let _goal_achieved = req.body.goal_achieved ? req.body.goal_achieved : null;
            let _goal_achieved_from = req.body.goal_achieved_from ? req.body.goal_achieved_from : null;
            let _goal_achieved_to = req.body.goal_achieved_to ? req.body.goal_achieved_to : null;
            let _status = req.body.status ? req.body.status : null;
            let _created_by = req.body.userid ? req.body.userid : null;
            let _updated_by = req.body.userid ? req.body.userid : null;

            let _query;
            let errMsgType = _rg_id ? 'UPDATE_FAILED' : 'ADD_FAILED'
            let successMsgType = _rg_id ? 'UPDATE_SUCCESS' : 'ADD_SUCCESS'

            if (!_rg_id) {

                _query = {
                    text: "INSERT INTO tbl_referrer_goals(goal_name,goal_value,goal_description,reward_amount,goal_achieved,goal_achieved_from ,goal_achieved_to,status,created_by,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,now()) RETURNING *",
                    values: [
                        _goal_name, _goal_value, _goal_description, _reward_amount, _goal_achieved, _goal_achieved_from, _goal_achieved_to, _status, _created_by
                    ]
                }
            }
            else {

                _query = {
                    text: "UPDATE tbl_referrer_goals SET goal_name=$1,goal_value=$2,goal_description=$3,reward_amount=$4,goal_achieved=$5,goal_achieved_from =$6,goal_achieved_to=$7,status=$8,updated_by=$9,updated_at=now() WHERE rg_id=$10 RETURNING *",
                    values: [
                        _goal_name, _goal_value, _goal_description, _reward_amount, _goal_achieved, _goal_achieved_from, _goal_achieved_to, _status, _updated_by, _rg_id
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

        let _id = req.body.id ? req.body.id : null;

        let _selectQuery = 'SELECT * FROM tbl_referrer_goals WHERE  1=1'

        if (_id) {
            _selectQuery += " AND rg_id = " + _id
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

    },

    getReferrerPlayerMaster: async function (req, res) {

        let _rpm_id = req.body.rpm_id ? req.body.rpm_id : null;

        let _selectQuery = "SELECT * FROM tbl_referrer_player_master WHERE  1=1 ";

        if (_rpm_id) {
            _selectQuery += "AND rpm_id = " + _rpm_id
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

    },

    getReferrerTransaction: async function (req, res) {

        let _rpt_id = req.body.rpt_id ? req.body.rpt_id : null;

        let _selectQuery = "SELECT * FROM tbl_referrer_player_transaction WHERE  1=1 ";

        if (_rpt_id) {
            _selectQuery += "AND rpt_id = " + _rpt_id
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