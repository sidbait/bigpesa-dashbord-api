const pgConnection = require('../../model/pgConnection');

const services = require('../../service/service');

const customMsgType = "MASTER_MESSAGE";
const customMsgTypeCM = "COMMON_MESSAGE";

module.exports = {
    contestReport: async function (req, res) {

        let rules = {
            "appid": 'required',
            "date": 'required'
        };
        var custom_message = {
            "required.appid": "App Id is mandatory!",
            "required.date": "Date is mandatory!"
        };
        let validation = new services.validator(req.body, rules, custom_message);
        if (validation.passes()) {
            let appid = req.body.appid;
            let date = req.body.date;
            try {
                let query = "select * from vw_contest_report where app_id = " + appid + " " +
                    " and contest_date = '" + date + "'";
                console.log(query)
                let result = await pgConnection.executeQuery('rmg_dev_db', query)
                if (result.length > 0) {
                    services.sendResponse.sendWithCode(req, res, result, customMsgType, "GET_SUCCESS");
                } else {
                    services.sendResponse.sendWithCode(req, res, result, customMsgType, "GET_FAILED");
                }
            }
            catch (error) {
                services.sendResponse.sendWithCode(req, res, error, customMsgTypeCM, "DB_ERROR");
            }
        } else {
            services.sendResponse.sendWithCode(req, res, validation.errors.errors, customMsgTypeCM, "VALIDATION_FAILED");
        }
    },
    registered: async function (req, res) {
        let rules = {
            "frmdate": 'required',
            "todate": 'required'
        };
        var custom_message = {
            "required.frmdate": "From Date is mandatory!",
            "required.todate": "To Date is mandatory!"
        };
        let validation = new services.validator(req.body, rules, custom_message);
        try {
            if (validation.passes()) {
                console.log( req.body)
                let fromDate = req.body.frmdate;
                let toDate = req.body.todate;
                let query = "select created_at::DATE dt, source, count(*) total_user, " +
                    " sum(case when phone_number_verified is true then 1 else 0 end) as verified_user " +
                    " from tbl_player where created_at between '" + fromDate + "' and '" + toDate + "' " +
                    " group by created_at::DATE, source,phone_number_verified order by dt desc;";
                let result = await pgConnection.executeQuery('rmg_dev_db', query)
                if (result.length > 0) {
                    services.sendResponse.sendWithCode(req, res, result, customMsgType, "GET_SUCCESS");
                } else {
                    services.sendResponse.sendWithCode(req, res, result, customMsgType, "GET_FAILED");
                }
            } else {
                services.sendResponse.sendWithCode(req, res, validation.errors.errors, customMsgTypeCM, "VALIDATION_FAILED");
            }
        }
        catch (error) {
            services.sendResponse.sendWithCode(req, res, error, customMsgTypeCM, "DB_ERROR");
        }
    },
    userAcquisitionSummary:async function(req,res){
        let rules = {
            "frmdate": 'required',
            "todate": 'required'
        };
        var custom_message = {
            "required.frmdate": "From Date is mandatory!",
            "required.todate": "To Date is mandatory!"
        };
        let validation = new services.validator(req.body, rules, custom_message);
        try {
            if (validation.passes()) {
                console.log( req.body)
                let fromDate = req.body.frmdate;
                let toDate = req.body.todate;
                let query = " select p.created_at::DATE as recharge_on, p.source, " +
                " count(p.player_id) total_register, sum(CASE WHEN p.phone_number_verified = true " +
                " THEN 1 ELSE 0 END) total_verified, coalesce( sum(w3.amount::DECIMAL), 0) first_recharge, " +
                "  coalesce( sum(w.amount::DECIMAL),0) total_revenue from tbl_player p " +
                " LEFT join tbl_wallet_transaction w on p.player_id = w.player_id and " +
                " w.nz_txn_type = 'DEPOSIT' and w.nz_txn_status = 'SUCCESS'  " +
                " LEFT JOIN (select w2.player_id, w2.mobile_no, w2.created_at, w2.amount " +
                " from tbl_wallet_transaction w2 " +
                " join (select w1.mobile_no, min(w1.created_at) cr_at from tbl_wallet_transaction w1 " +
                " where w1.nz_txn_type = 'DEPOSIT' and w1.nz_txn_status = 'SUCCESS' " +
                " group by w1.mobile_no) w1 on w2.mobile_no = w1.mobile_no and " +
                " w2.created_at = w1.cr_at) w3 on w3.player_id = p.player_id " +
                " where p.created_at between '"+ fromDate +"' and '"+ toDate +"' " +
                " group by p.source, p.created_at::DATE " +
                " order by recharge_on desc, p.source; ";

                let result = await pgConnection.executeQuery('rmg_dev_db', query)
                if (result.length > 0) {
                    services.sendResponse.sendWithCode(req, res, result, customMsgType, "GET_SUCCESS");
                } else {
                    services.sendResponse.sendWithCode(req, res, result, customMsgType, "GET_FAILED");
                }
            } else {
                services.sendResponse.sendWithCode(req, res, validation.errors.errors, customMsgTypeCM, "VALIDATION_FAILED");
            }
        }
        catch (error) {
            services.sendResponse.sendWithCode(req, res, error, customMsgTypeCM, "DB_ERROR");
        }
    },
    userAcquisitionDetail:async function(req,res){
        let rules = {
            "frmdate": 'required',
            "todate": 'required'
        };
        var custom_message = {
            "required.frmdate": "From Date is mandatory!",
            "required.todate": "To Date is mandatory!"
        };
        let validation = new services.validator(req.body, rules, custom_message);
        try {
            if (validation.passes()) {
                console.log( req.body)
                let fromDate = req.body.frmdate;
                let toDate = req.body.todate;
                let query = " select p.phone_number, p.source, p.phone_number_verified, " +
                " p.created_at, sum(w.amount::DECIMAL) total_revenue, w3.created_at as recharge_on, " +
                " w3.amount recharge_amount from tbl_player p " +
                " LEFT join tbl_wallet_transaction w on p.player_id = w.player_id " +
                " and w.nz_txn_type = 'DEPOSIT' and w.nz_txn_status = 'SUCCESS'  " +
                " LEFT JOIN (select w2.player_id, w2.mobile_no, w2.created_at, " +
                " w2.amount from tbl_wallet_transaction w2 " +
                " join (select w1.mobile_no, min(w1.created_at) cr_at " +
                " from tbl_wallet_transaction w1 " +
                " where  w1.nz_txn_type = 'DEPOSIT' and w1.nz_txn_status = 'SUCCESS' " +
                " group by w1.mobile_no) w1 on w2.mobile_no = w1.mobile_no and " +
                " w2.created_at = w1.cr_at) w3 on w3.player_id = p.player_id " +
                " where p.created_at between '"+ fromDate +"' and '"+ toDate +"' " +
                " group by p.phone_number, p.source, p.phone_number_verified, " +
                " p.created_at, w3.created_at, w3.amount order by total_revenue desc;";

                let result = await pgConnection.executeQuery('rmg_dev_db', query)
                if (result.length > 0) {
                    services.sendResponse.sendWithCode(req, res, result, customMsgType, "GET_SUCCESS");
                } else {
                    services.sendResponse.sendWithCode(req, res, result, customMsgType, "GET_FAILED");
                }
            } else {
                services.sendResponse.sendWithCode(req, res, validation.errors.errors, customMsgTypeCM, "VALIDATION_FAILED");
            }
        }
        catch (error) {
            services.sendResponse.sendWithCode(req, res, error, customMsgTypeCM, "DB_ERROR");
        }
    },
    summary :async function(req,res){
        let rules = {
            "frmdate": 'required',
            "todate": 'required'
        };
        var custom_message = {
            "required.frmdate": "From Date is mandatory!",
            "required.todate": "To Date is mandatory!"
        };
        let validation = new services.validator(req.body, rules, custom_message);
        try {
            if (validation.passes()) {
                console.log( req.body)
                let fromDate = req.body.frmdate;
                let toDate = req.body.todate;
                let query = " select  * from tbl_summary_report " +
                " where dt between '"+ fromDate +"' and '"+ toDate +"'  " +
                " order by dt asc;";
                let result = await pgConnection.executeQuery('rmg_dev_db', query)
                if (result.length > 0) {
                    services.sendResponse.sendWithCode(req, res, result, customMsgType, "GET_SUCCESS");
                } else {
                    services.sendResponse.sendWithCode(req, res, result, customMsgType, "GET_FAILED");
                }
            } else {
                services.sendResponse.sendWithCode(req, res, validation.errors.errors, customMsgTypeCM, "VALIDATION_FAILED");
            }
        }
        catch (error) {
            services.sendResponse.sendWithCode(req, res, error, customMsgTypeCM, "DB_ERROR");
        }
    },
    dashboardReport:async function(req,res){
        let queryCashDetails = "select  " +
        " coalesce( sum(case when nz_txn_type = 'DEBIT' then amount::decimal else 0 end),0) as debit," +
        " coalesce( sum(case when nz_txn_type = 'CREDIT' then amount::decimal else 0 end ),0) as credit, " +
        " coalesce( sum(case when nz_txn_type = 'DEPOSIT' then amount::decimal else 0 end),0) as deposit, " +
        " coalesce( sum(case when nz_txn_type = 'WITHDRAW' then amount::decimal else 0 end),0) as withdraw , " +
        " coalesce( sum(case when nz_txn_type = 'REFUND' then amount::decimal else 0 end),0) as refund " +
        " from tbl_wallet_transaction  " +
        " where created_at::date = now()::date  and  nz_txn_status = 'SUCCESS' ";
        let queryTotalPlayer = "select count(*) as count from tbl_player "
        Promise.all([
            pgConnection.executeQuery('rmg_dev_db', queryTotalPlayer),
            pgConnection.executeQuery('rmg_dev_db', queryCashDetails)
        ]).then(function(value){
           
            let output = {};
            output.TotPlayer = value[0][0].count;
            output.TotCredit = value[1][0].credit;
            output.TotDebit = value[1][0].debit;
            output.TotDeposit = value[1][0].deposit;
            output.TotWithdraw = value[1][0].withdraw;
            output.TotRefund = value[1][0].refund; 
            services.sendResponse.sendWithCode(req, res, output, customMsgType, "GET_SUCCESS");
        }).catch(function(err){
            services.sendResponse.sendWithCode(req, res, err, customMsgTypeCM, "DB_ERROR");
        })
    }
}