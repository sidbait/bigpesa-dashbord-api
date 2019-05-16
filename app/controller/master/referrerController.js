const pgConnection = require('../../model/pgConnection');

const services = require('../../service/service');

const customMsgType = "MASTER_MESSAGE";
const customMsgTypeCM = "COMMON_MESSAGE";

module.exports = {

    getAll: async function (req, res) {

        let _selectQuery = "SELECT * FROM tbl_referrer_master"
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
            "total_reward": 'required',
            "reward_amount": 'required',
            "min_withdrawl": 'required',
            "success_referrer_on": 'required',
            "credit_deposit": 'required',
            "credit_deposit_wallet": 'required',
            "min_deposit": 'required',
            "deposit_margin": 'required',
            "max_deposit_reward": 'required',
            "credit_game_play": 'required',
            "game_play_margin": 'required',
            "max_game_play_reward": 'required',
            "game_play_deposit_wallet": 'required',
        };

        let validation = new services.validator(req.body, rules);

        if (validation.passes()) {
            let _rm_id = req.body.rm_id ? req.body.rm_id : null;
            let _total_reward = req.body.total_reward ? req.body.total_reward : null;
            let _reward_amount = req.body.reward_amount ? req.body.reward_amount : null;
            let _min_withdrawl = req.body.min_withdrawl ? req.body.min_withdrawl : null;
            let _success_referrer_on = req.body.success_referrer_on ? req.body.success_referrer_on : null;
            let _credit_deposit = req.body.credit_deposit ? req.body.credit_deposit : false;
            let _credit_deposit_wallet = req.body.credit_deposit_wallet ? req.body.credit_deposit_wallet : null;
            let _min_deposit = req.body.min_deposit ? req.body.min_deposit : null;
            let _deposit_margin = req.body.deposit_margin ? req.body.deposit_margin : null;
            let _max_deposit_reward = req.body.max_deposit_reward ? req.body.max_deposit_reward : null;
            let _credit_game_play = req.body.credit_game_play ? req.body.credit_game_play : false;
            let _game_play_margin = req.body.game_play_margin ? req.body.game_play_margin : null;
            let _max_game_play_reward = req.body.max_game_play_reward ? req.body.max_game_play_reward : null;
            let _game_play_deposit_wallet = req.body.game_play_deposit_wallet ? req.body.game_play_deposit_wallet : null;
            let _created_by = req.body.userid ? req.body.userid : null;
            let _updated_by = req.body.userid ? req.body.userid : null;
            
            let _query;
            let errMsgType = _rm_id ? 'UPDATE_FAILED' : 'ADD_FAILED'
            let successMsgType = _rm_id ? 'UPDATE_SUCCESS' : 'ADD_SUCCESS'

            if (!_rm_id) {

                _query = {
                    text: "INSERT INTO tbl_referrer_master(total_reward,reward_amount,min_withdrawl,success_referrer_on,credit_deposit,credit_deposit_wallet,min_deposit,deposit_margin,max_deposit_reward,credit_game_play,game_play_margin,max_game_play_reward,game_play_deposit_wallet,created_by,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,now()) RETURNING *",
                    values: [
                        _total_reward, _reward_amount, _min_withdrawl, _success_referrer_on, _credit_deposit, _credit_deposit_wallet, _min_deposit, _deposit_margin, _max_deposit_reward, _credit_game_play, _game_play_margin, _max_game_play_reward, _game_play_deposit_wallet, _created_by
                    ]
                }
            }
            else {

                _query = {
                    text: "UPDATE tbl_referrer_master SET total_reward=$1,reward_amount=$2,min_withdrawl=$3,success_referrer_on=$4,credit_deposit=$5,credit_deposit_wallet=$6,min_deposit=$7,deposit_margin=$8,max_deposit_reward=$9,credit_game_play=$10,game_play_margin=$11,max_game_play_reward=$12,game_play_deposit_wallet=$13,updated_by=$14,updated_at=now() WHERE rm_id=$15 RETURNING *",
                    values: [
                        _total_reward, _reward_amount, _min_withdrawl, _success_referrer_on, _credit_deposit, _credit_deposit_wallet, _min_deposit, _deposit_margin, _max_deposit_reward, _credit_game_play, _game_play_margin, _max_game_play_reward, _game_play_deposit_wallet, _updated_by, _rm_id
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

        let _selectQuery = 'SELECT * FROM tbl_referrer_master WHERE  1=1'

        if (_id) {
            _selectQuery += " AND rm_id = " + _id
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

    getById: async function (req, res) {

        let _visitbonus_id = req.body.visitbonus_id ? req.body.visitbonus_id : null;

        let _selectQuery = "SELECT * FROM tbl_referrer_master WHERE  1=1 AND id = " + _visitbonus_id;

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