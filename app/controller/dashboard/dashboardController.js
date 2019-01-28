const pgConnection = require('../../model/pgConnection');
const services = require('../../service/service');

const customMsgType = "MASTER_MESSAGE";
const customMsgTypeCM = "COMMON_MESSAGE";

module.exports = {

    downloadSummary: async function (req, res) {
        let _startdate = req.body.startdate ? req.body.startdate : null;
        let _enddate = req.body.enddate ? req.body.enddate : null;

        let _selectQuery = `select
        app_download.download_date:: date,
            count(distinct player_device.device_id) as register,
            count(distinct case when player.phone_number_verified = true then player_device.player_id end)
        as otp_verified
        from
            tbl_app_download app_download
        left join tbl_player_device player_device on
            player_device.device_id = app_download.device_id
        left join tbl_player player on
            player.player_id = player_device.player_id
        where
            app_download.download_date:: date between '${_startdate}' and '${_enddate}'
        group by
            app_download.download_date:: date
        order by
            app_download.download_date:: date desc`;

        try {
            let dbResult = await pgConnection.executeQuery('rmg_dev_db', _selectQuery)
            console.log(dbResult);

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

    cashSummary: async function (req, res) {
        let _startdate = req.body.startdate ? req.body.startdate : null;
        let _enddate = req.body.enddate ? req.body.enddate : null;

        let _selectQuery = `select created_at::date::string, COALESCE(sum(case when nz_txn_type = 'DEPOSIT' then amount::decimal end),0) as DEPOSIT, COALESCE(sum(case when nz_txn_type = 'DEBIT' then amount::decimal end),0) as DEBIT, COALESCE(sum(case when nz_txn_type = 'CREDIT' then amount::decimal end),0) as CREDIT, COALESCE(sum(case when nz_txn_type = 'WITHDRAW' then amount::decimal end),0) as WITHDRAW, sum(amount::decimal) as total from tbl_wallet_transaction  where nz_txn_status = 'SUCCESS' and created_at::date between '${_startdate}' and '${_enddate}' group by created_at::date::string order by 1`;

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