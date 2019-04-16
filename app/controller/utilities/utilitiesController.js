const pgConnection = require('../../model/pgConnection');

const services = require('../../service/service');

const customMsgType = "MASTER_MESSAGE";
const customMsgTypeCM = "COMMON_MESSAGE";

module.exports = {

    searchQueue: async function (req, res) {

        let fromDate = req.body.frmdate;
        let toDate = req.body.todate;
        let que_type = req.body.que_type ? req.body.que_type : '';
        let extraTime = ` + (330 * '1m'::interval)`;
        let _selectQuery = '';


        if (que_type == 'CASH_WALLET_QUEUE') {
            _selectQuery = `select 'CASH_WALLET_QUEUE' as que_type,(add_date ${extraTime})::date as add_date, status, 
        count(1) as total_queue,
        count(case when is_credit = true then 1 end) as credited,
        sum(case when is_credit = true then amount end) as credited_amount,
        count(case when is_credit = false then 1 end) as pending,
        sum(case when is_credit = false then amount end) as pending_amount
        from tbl_wallet_credit_que 
        where 1 =1 `

            if (fromDate && toDate) {
                _selectQuery += ` and (add_date ${extraTime})::date between '${fromDate}' and '${toDate}'`
            }

            _selectQuery += `  group by (add_date ${extraTime})::date, status order by 1 desc `;

        } else if (que_type == 'COIN_WALLET_QUEUE') {

            _selectQuery = `select 'COIN_WALLET_QUEUE' as que_type,(add_date ${extraTime})::date as add_date, status, 
            count(1) as total_queue,
            count(case when is_credit = true then 1 end) as credited,
            sum(case when is_credit = true then amount end) as credited_amount,
            count(case when is_credit = false then 1 end) as pending,
            sum(case when is_credit = false then amount end) as pending_amount
            from tbl_bonus_credit_que 
            where 1 =1 `

            if (fromDate && toDate) {
                _selectQuery += ` and (add_date ${extraTime})::date between '${fromDate}' and '${toDate}'`
            }

            _selectQuery += `  group by (add_date ${extraTime})::date, status order by 1 desc `;

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

    getPendingData: async function (req, res) {

        let date = req.body.date;
        let status = req.body.status;
        let que_type = req.body.que_type ? req.body.que_type : '';
        let _selectQuery = '';

        let extraTime = ` + (330 * '1m'::interval)`
        if (que_type == 'CASH_WALLET_QUEUE') {
            _selectQuery = `select * from tbl_wallet_credit_que where add_date::date = '${date}' and status = '${status}' and is_credit = false`;
        } else if (que_type == 'COIN_WALLET_QUEUE') {
            _selectQuery = `select * from tbl_bonus_credit_que where add_date::date = '${date}' and status = '${status}' and is_credit = false`
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

}