const pgConnection = require('../../model/pgConnection');

const jsonToPivotjson = require("json-to-pivot-json");

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
            "startdate": 'required',
            "enddate": 'required'
        };
        var custom_message = {
            "required.startdate": "Date is mandatory!",
            "required.enddate": "Date is mandatory!"
        };
        let validation = new services.validator(req.body, rules, custom_message);
        if (validation.passes()) {
            let appid = req.body.appid;
            let startdate = req.body.startdate;
            let enddate = req.body.enddate;
            try {
                queryText = "select contest_name, count(contest_name) as total_contest, start_date, debit_type, credit_type, entry_fee, prize_pool, max_players," +
                    " sum(players_joined) as players_joined," +
                    " sum(max_players) as players_joined_limit," +
                    " (entry_fee * sum(players_joined)) as player_amount," +
                    " (entry_fee * sum(max_players)) as contest_amount," +
                    " sum(win_cash) as win_cash," +
                    " sum(win_coin) as win_coin" +
                    " from vw_admin_contest_summary_report";

                if (appid) {
                    queryText += " where app_id = $1 and start_date::Date between $2 and $3";
                    valuesArr = [appid, startdate, enddate];
                } else {
                    queryText += " where start_date::Date between $1 and $2";
                    valuesArr = [startdate, enddate]
                }
                queryText += " group by contest_name, start_date, debit_type, credit_type, entry_fee, prize_pool, max_players" +
                    " order by players_joined desc";

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
    channelAcquisitionSummary: async function (req, res) {
        let rules = {
            "frmdate": 'required',
            "todate": 'required',
            "channel": 'required'
        };
        var custom_message = {
            "required.frmdate": "From Date is mandatory!",
            "required.todate": "To Date is mandatory!",
            "required.channel": "Channel is mandatory!"
        };
        let validation = new services.validator(req.body, rules, custom_message);
        try {
            if (validation.passes()) {
                console.log(req.body)
                let fromDate = req.body.frmdate;
                let toDate = req.body.todate;
                let channel = req.body.channel;
                let source = req.body.source ? req.body.source : '';

                queryText = "select * from tbl_acquisition_summary_channel" +
                    " where channel = $1" +
                    " and reg_source ilike '%" + source + "%'" +
                    " and report_date between $2 and $3" +
                    " ORDER BY report_date, reg_source";
                valuesArr = [channel, fromDate, toDate]

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
    dailySummary: async function (req, res) {
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
                let queryText = "select * from tbl_daily_summary where report_date between $1 and $2 ORDER BY report_date asc ";
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
    dailyChannelWiseSummary: async function (req, res) {
        let rules = {
            "frmdate": 'required',
            "todate": 'required',
            "channel": 'required',

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
                let channel = req.body.channel;
                let queryText = "select * from tbl_daily_channel_summary" +
                    " where channel = $1 and report_date between $2 and $3" +
                    " ORDER BY report_date asc";
                valuesArr = [channel, fromDate, toDate]

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
                let queryText = "select created_at::date::string," +
                    " count(distinct case when nz_txn_type = 'DEPOSIT' then player_id end) as deposit_count," +
                    " COALESCE(sum(case when nz_txn_type = 'DEPOSIT' then amount::decimal end),0) as DEPOSIT," +
                    " count(distinct case when nz_txn_type = 'DEBIT' then player_id end) as debit_count," +
                    " COALESCE(sum(case when nz_txn_type = 'DEBIT' then amount::decimal end),0) as DEBIT," +
                    " count(distinct case when nz_txn_type = 'CREDIT' then player_id end) as credit_count," +
                    " COALESCE(sum(case when nz_txn_type = 'CREDIT' then amount::decimal end),0) as CREDIT," +
                    " count(distinct case when nz_txn_type = 'WITHDRAW' then player_id end) as withdraw_count," +
                    " COALESCE(sum(case when nz_txn_type = 'WITHDRAW' then amount::decimal end),0) as WITHDRAW," +
                    " sum(amount::decimal) as total" +
                    " from tbl_wallet_transaction " +
                    " where nz_txn_status = 'SUCCESS'" +
                    " and created_at::date between $1 and $2" +
                    " group by created_at::date::string" +
                    " order by 1 desc";

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
                    " where \"date\"::Date between $1 and $2" +
                    " ORDER BY total_players_joined desc";
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
    hourlyReport: async function (req, res) {
        let rules = {
            "frmdate": 'required',
            "todate": 'required'
        };

        let validation = new services.validator(req.body, rules);
        try {
            if (validation.passes()) {
                console.log(req.body)
                let fromDate = req.body.frmdate;
                let toDate = req.body.todate;
                let source = req.body.source ? req.body.source : '';
                queryText = `select
                created_at::date::string,
                 extract(hour from created_at) as hours,
                count(1) as total_register,
                count(case phone_number_verified when true then 1 end) as verified
            from
                tbl_player
            where
                1 = 1
                and source ilike '%` + source + `%'
                and created_at::date between $1 and $2
            group by
                created_at::date,
                extract(hour
            from
                created_at)
            order by
                1,
                2;`;
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
    balanceReport: async function (req, res) {
        let rules = {
            "frmdate": 'required',
            "todate": 'required',
        };

        let validation = new services.validator(req.body, rules);
        //try {
        if (validation.passes()) {
            console.log(req.body)
            let fromDate = req.body.frmdate;
            let toDate = req.body.todate;
            let balance_type = req.body.balance_type ? req.body.balance_type : false;
            let range = req.body.range ? req.body.range : false;

            let query = "select report_date::date::string, balance_type, balance_range, players, amount" + " from tbl_balance_range where 1 = 1";

            if (balance_type) {
                query += " and balance_type = '" + balance_type + "'";
            }

            if (range) {
                query += " and priority = " + range;
            }

            query += " and report_date between '" + fromDate + "' and '" + toDate +
                "' order by report_date, priority ";

            let result = await pgConnection.executeQuery('rmg_dev_db', query)
            if (result.length > 0) {
                services.sendResponse.sendWithCode(req, res, result, customMsgType, "GET_SUCCESS");
            } else {
                services.sendResponse.sendWithCode(req, res, result, customMsgType, "GET_FAILED");
            }
        } else {
            services.sendResponse.sendWithCode(req, res, validation.errors.errors, customMsgTypeCM, "VALIDATION_FAILED");
        }
        //}
        // catch (error) {
        //     services.sendResponse.sendWithCode(req, res, error, customMsgTypeCM, "DB_ERROR");
        // }
    },
    retentionReport: async function (req, res) {
        let rules = {
            "frmdate": 'required',
            "column_name": 'required'
        };

        let validation = new services.validator(req.body, rules);
        try {
            if (validation.passes()) {
                console.log(req.body)
                let fromDate = req.body.frmdate;
                let column_name = req.body.column_name;
                queryText = "select reg_date::string,trans_date::string, total_register, " + column_name +
                    " from tbl_user_funnel" +
                    " where reg_date::date >= '" + fromDate + "'" +
                    " and trans_date::date >= '" + fromDate + "'" +
                    " order by 1,2";

                let result = await pgConnection.executeQuery('rmg_dev_db', queryText)

                const rlength = result.length;
                var element = null;
                let total_register = [];
                for (let i = 0; i < rlength; i++) {
                    if (result[i].reg_date == result[i].trans_date) {
                        element = result[i];
                        total_register.push(element.total_register);
                    }
                }

                if (rlength > 0) {
                    let options = {
                        row: "reg_date",
                        column: "trans_date",
                        value: column_name
                    };
                    let output = jsonToPivotjson(result, options);

                    let count = 0;
                    let finalout = [];
                    output.forEach(element => {
                        let out = {}
                        let isadded = false;
                        for (var k in element) {
                            if (k == "reg_date") {
                                out[k] = element[k]
                            } else {
                                if (!isadded) {
                                    isadded = true;
                                    out['total_register'] = total_register[count];
                                    out[k] = element[k]
                                } else {
                                    out[k] = element[k]
                                }
                            }
                        }
                        finalout.push(out)
                        count = count + 1;
                    });

                    services.sendResponse.sendWithCode(req, res, finalout, customMsgType, "GET_SUCCESS");
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
    channelRetentionReport: async function (req, res) {
        let rules = {
            "frmdate": 'required',
            "channel": 'required',
            "column_name": 'required'
        };

        let validation = new services.validator(req.body, rules);
        try {
            if (validation.passes()) {
                console.log(req.body)
                let fromDate = req.body.frmdate;
                let channel = req.body.channel;
                let column_name = req.body.column_name;
                queryText = "select reg_date::string,trans_date::string, total_register, " + column_name +
                    " from tbl_user_funnel_channel" +
                    " where channel = '" + channel + "'" +
                    " and reg_date::date >= '" + fromDate + "'" +
                    " and trans_date::date >= '" + fromDate + "'" +
                    " order by 1,2";

                let result = await pgConnection.executeQuery('rmg_dev_db', queryText)

                const rlength = result.length;
                var element = null;
                let total_register = [];
                for (let i = 0; i < rlength; i++) {
                    if (result[i].reg_date == result[i].trans_date) {
                        element = result[i];
                        total_register.push(element.total_register);
                    }
                }

                if (rlength > 0) {
                    let options = {
                        row: "reg_date",
                        column: "trans_date",
                        value: column_name
                    };
                    let output = jsonToPivotjson(result, options);

                    let count = 0;
                    let finalout = [];
                    output.forEach(element => {
                        let out = {}
                        let isadded = false;
                        for (var k in element) {
                            //console.log(k)
                            if (k == "reg_date") {
                                out[k] = element[k]
                            } else {
                                if (!isadded) {
                                    isadded = true;
                                    out['total_register'] = total_register[count];
                                    out[k] = element[k]
                                } else {
                                    out[k] = element[k]
                                }
                            }
                        }
                        finalout.push(out)
                        count = count + 1;
                    });

                    services.sendResponse.sendWithCode(req, res, finalout, customMsgType, "GET_SUCCESS");
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
    }
}