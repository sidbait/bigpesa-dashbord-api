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
                //vw_contest_report
                /*  let query = "select * from vw_admin_contest_report where app_id = " + appid + " " +
                     " and start_date = '" + date + "'";
                 console.log(query)
  */
                queryText = "select * from vw_admin_contest_report where app_id = $1 and start_date::Date = $2";
                valuesArr = [appid, date]

                let query = {
                    text: queryText,
                    values: valuesArr
                };

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
    contestSummaryReport: async function (req, res) {

        let rules = {
            "appid": 'required',
            "startdate": 'required',
            "enddate": 'required'
        };
        var custom_message = {
            "required.appid": "App Id is mandatory!",
            "required.startdate": "Date is mandatory!",
            "required.enddate": "Date is mandatory!"
        };
        let validation = new services.validator(req.body, rules, custom_message);
        if (validation.passes()) {
            let appid = req.body.appid;
            let startdate = req.body.startdate;
            let enddate = req.body.enddate;
            try {
                queryText = "select * from vw_admin_contest_summary_report where app_id = $1 and start_date::Date between $2 and $3";
                valuesArr = [appid, startdate, enddate]

                let query = {
                    text: queryText,
                    values: valuesArr
                };

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

    downloadSummary: async function (req, res) {

        let rules = {
            "startdate": 'required',
            "enddate": 'required'
        };
        var custom_message = {
            "required.startdate": "Date is mandatory!",
            "required.enddate": "Date is mandatory!"
        };
        let validation = new services.validator(req.body, rules, custom_message);
        if (validation.passes()) {
            let startdate = req.body.startdate;
            let enddate = req.body.enddate;
            try {
                queryText = "select app_download.download_date::DATE, app_download.agency_source," +
                    " count(distinct app_download.download_id) as downloads," +
                    " count(distinct player_device.device_id) as register," +
                    " count(distinct CASE WHEN player.phone_number_verified = true THEN player_device.player_id END) AS otp_verified" +
                    " from tbl_app_download app_download" +
                    " left join tbl_player_device player_device on player_device.device_id = app_download.device_id" +
                    " left join tbl_player player on player.player_id = player_device.player_id" +
                    " where app_download.download_date::DATE between $1 and $2" +
                    " group by app_download.agency_source, app_download.download_date::DATE" +
                    " order by app_download.download_date::DATE desc";
                valuesArr = [startdate, enddate]

                let query = {
                    text: queryText,
                    values: valuesArr
                };

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
                console.log(req.body)
                let fromDate = req.body.frmdate;
                let toDate = req.body.todate;

                queryText = "select * from vw_admin_register_summary where report_date between $1 and $2 ORDER BY report_date";
                valuesArr = [fromDate, toDate]

                let query = {
                    text: queryText,
                    values: valuesArr
                };

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
    userAcquisitionSummary: async function (req, res) {
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
                console.log(req.body)
                let fromDate = req.body.frmdate;
                let toDate = req.body.todate;

                queryText = "select * from vw_admin_acquisition_summary where report_date between $1 and $2 ORDER BY report_date, reg_source";
                valuesArr = [fromDate, toDate]

                let query = {
                    text: queryText,
                    values: valuesArr
                };

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
    userAcquisitionDetail: async function (req, res) {
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
                console.log(req.body)
                let fromDate = req.body.frmdate;
                let toDate = req.body.todate;

                queryText = "select * from vw_admin_acquisition_details where register_date::Date between $1 and $2 ORDER BY register_date desc ";
                valuesArr = [fromDate, toDate]

                let query = {
                    text: queryText,
                    values: valuesArr
                };

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

    userFunnelSummary: async function (req, res) {
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
                console.log(req.body)
                let fromDate = req.body.frmdate;
                let toDate = req.body.todate;
                queryText = "select * from vw_admin_user_funnel where reg_date::Date between $1 and $2 ORDER BY trans_date asc ";
                valuesArr = [fromDate, toDate]

                let query = {
                    text: queryText,
                    values: valuesArr
                };

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
    summary: async function (req, res) {
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
                console.log(req.body)
                let fromDate = req.body.frmdate;
                let toDate = req.body.todate;
                let query = " select  * from tbl_summary_report " +
                    " where dt between '" + fromDate + "' and '" + toDate + "'  " +
                    " order by dt asc;";


                /*  queryText = "select * from vw_admin_user_funnel where reg_date::Date between $1 and $2 ORDER BY trans_date asc ";
                 valuesArr = [fromDate, toDate]
 
                 let query = {
                     text: queryText,
                     values: valuesArr
                 }; */


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
    cashReport: async function (req, res) {
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
                console.log(req.body)
                let fromDate = req.body.frmdate;
                let toDate = req.body.todate;
                let queryText = " select created_at::date::string," +
                    " COALESCE(sum(case when nz_txn_type = 'DEPOSIT' then amount::decimal end),0) as DEPOSIT," +
                    " COALESCE(sum(case when nz_txn_type = 'DEBIT' then amount::decimal end),0) as DEBIT," +
                    " COALESCE(sum(case when nz_txn_type = 'CREDIT' then amount::decimal end),0) as CREDIT," +
                    " COALESCE(sum(case when nz_txn_type = 'WITHDRAW' then amount::decimal end),0) as WITHDRAW," +
                    " sum(amount::decimal) as total" +
                    " from tbl_wallet_transaction " +
                    " where nz_txn_status = 'SUCCESS'" +
                    " and created_at::date between $1 and $2" +
                    " group by created_at::date::string" +
                    " order by 1";

                let valuesArr = [fromDate, toDate]
                let query = {
                    text: queryText,
                    values: valuesArr
                };

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
    paymentgatewayReport: async function (req, res) {
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
                console.log(req.body)
                let fromDate = req.body.frmdate;
                let toDate = req.body.todate;
                let queryText = "select created_at::date::string, pg_source, nz_txn_status, count(1) as pcount, sum(amount::decimal) as total" +
                    " from tbl_wallet_transaction" +
                    " where nz_txn_type = 'DEPOSIT'" +
                    " and amount ~ '^[0-9\.]+$' = true" +
                    " and created_at::date between $1 and $2" +
                    " group by created_at::date::string, pg_source, nz_txn_status" +
                    " order by 1";

                let valuesArr = [fromDate, toDate]
                let query = {
                    text: queryText,
                    values: valuesArr
                };

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
    paymentgatewayDetailReport: async function (req, res) {
        let rules = {
            "status": 'required',
            "date": 'required',
            "source": 'required'
        };
        var custom_message = {
            "required.status": "status is mandatory!",
            "required.source": "source is mandatory!",
            "required.date": "date is mandatory!"
        };
        let validation = new services.validator(req.body, rules, custom_message);
        try {
            if (validation.passes()) {
                console.log(req.body)
                let status = req.body.status;
                let source = req.body.source;
                let date = req.body.date;
                let queryText = "select created_at, pg_source, nz_txn_status,player_id, mobile_no, amount from tbl_wallet_transaction" +
                    " where nz_txn_type = 'DEPOSIT'" +
                    " and amount ~ '^[0-9\.]+$' = true" +
                    " and created_at::date = $1" +
                    " and pg_source = $2" +
                    " and nz_txn_status = $3" +
                    " order by created_at";

                let valuesArr = [date, source, status]
                let query = {
                    text: queryText,
                    values: valuesArr
                };

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
    dashboardReport: async function (req, res) {
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
        ]).then(function (value) {

            let output = {};
            output.TotPlayer = value[0][0].count;
            output.TotCredit = value[1][0].credit;
            output.TotDebit = value[1][0].debit;
            output.TotDeposit = value[1][0].deposit;
            output.TotWithdraw = value[1][0].withdraw;
            output.TotRefund = value[1][0].refund;
            services.sendResponse.sendWithCode(req, res, output, customMsgType, "GET_SUCCESS");
        }).catch(function (err) {
            services.sendResponse.sendWithCode(req, res, err, customMsgTypeCM, "DB_ERROR");
        })
    },
    topGameSummary: async function (req, res) {
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
                console.log(req.body)
                let fromDate = req.body.frmdate;
                let toDate = req.body.todate;
                queryText = "select * from vw_admin_top_game_summary" +
                " where \"date\"::Date between $1 and $2 ORDER BY \"date\"::Date asc";
                valuesArr = [fromDate, toDate]

                let query = {
                    text: queryText,
                    values: valuesArr
                };

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
}