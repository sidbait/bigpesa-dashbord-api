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
            let appid = req.body.appid ? req.body.appid : false;
            let debit_type = req.body.debit_type ? req.body.debit_type : false;
            let credit_type = req.body.credit_type ? req.body.credit_type : false;
            let from_time = req.body.from_time ? req.body.from_time : false;
            let to_time = req.body.to_time ? req.body.to_time : false;
            let entry_fee = req.body.entry_fee ? req.body.entry_fee : false;
            let startdate = req.body.startdate;
            let enddate = req.body.enddate;
            let pivot = req.body.pivot ? req.body.pivot : false;
            try {

                let query = "select app.app_id, app_name, contest_name," +
                    " contest.start_date::date::text as start_date," +
                    " from_time, to_time," +
                    " contest.debit_type, contest.credit_type,  entry_fee," +
                    " sum(distinct contest.win_amount) as prize_pool," +
                    " contest.max_players as contest_max_players," +
                    // " max_players * count(distinct contest.contest_id) as total_max_players, " +
                    " count(distinct players.player_id) as players_joined," +
                    " count(winner.player_id) as players_win," +
                    " coalesce(sum(case when winner.credit_type = 'COIN' then winner.win_amount end),0) as win_coin," +
                    " coalesce(sum(case when winner.credit_type = 'CASH' then winner.win_amount end),0) as win_cash," +
                    " (max_players * count(distinct contest.contest_id)) - (count(distinct players.player_id)) as players_required," +
                    " count(distinct players.player_id) * entry_fee as user_debit_amount," +
                    " ((coalesce(count(distinct case when contest.debit_type = 'CASH' then players.player_id end), 0) * entry_fee) - (coalesce(sum(case when winner.credit_type = 'COIN' then 0 end), 0) + coalesce(sum(case when winner.credit_type = 'CASH' then winner.win_amount end), 0))) as profit" +
                    " from rmg_db.public.tbl_app as app" +
                    " inner join rmg_db.public.tbl_contest as contest on" +
                    " app.app_id = contest.app_id" +
                    " inner join rmg_db.public.tbl_contest_players as players on" +
                    " contest.contest_id = players.contest_id" +
                    " left join rmg_db.public.tbl_contest_winner as winner on" +
                    " (winner.contest_id = contest.contest_id) and (winner.player_id = players.player_id)" +
                    " where contest.start_date::date between '" + startdate + "' and '" + enddate + "'" +
                    " and players.transaction_date::date <= contest.start_date::date";

                if (appid) {
                    query += " and app.app_id = " + appid;
                }

                if (from_time) {
                    query += " and from_time = '" + from_time + "'";
                }

                if (to_time) {
                    query += " and to_time = '" + to_time + "'";
                }

                if (pivot) {
                    query += " and contest.debit_type = 'CASH' and contest.credit_type = 'CASH'";
                }

                if (debit_type) {
                    query += " and contest.debit_type = '" + debit_type + "'";
                }

                if (credit_type) {
                    query += " and contest.credit_type = '" + credit_type + "'";
                }

                if (to_time) {
                    query += " and to_time = '" + to_time + "'";
                }

                if (entry_fee) {
                    query += " and entry_fee = " + entry_fee;
                }

                query += " group by app.app_id, app_name, contest_name, entry_fee,contest.max_players, contest.start_date::date::text, from_time, to_time, contest.debit_type, contest.credit_type" +
                    " order by contest.start_date::date::text desc";

                let result = await pgConnection.executeQuery('rmg_dev_db', query);
                let l = result.length
                if (l > 0) {
                    if (pivot) {
                        let options = {
                            row: pivot,
                            column: "entry_fee",
                            value: "profit"
                        };
                        let output = jsonToPivotjson(result, options);

                        services.sendResponse.sendWithCode(req, res, output, customMsgType, "GET_SUCCESS");
                    } else {

                        services.sendResponse.sendWithCode(req, res, result, customMsgType, "GET_SUCCESS");
                    }
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
                queryText = "select app_download.download_date::date::text as download_date, app_download.agency_source," +
                    " COUNT(app_download.download_id) AS downloads," +
                    " count(distinct player.player_id) as register," +
                    " count(distinct CASE WHEN player.phone_number_verified = true THEN player.player_id END) AS otp_verified" +
                    " from tbl_app_download app_download" +
                    " left join tbl_player_device player_device on player_device.device_id = app_download.device_id" +
                    " left join tbl_player player on player.player_id = player_device.player_id" +
                    " where app_download.download_date::date between $1 and $2" +
                    " group by app_download.download_date::date::text, app_download.agency_source" +
                    " order by app_download.download_date::date::text desc";
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
                let queryText = "select (created_at + 330::double precision * '00:01:00'::interval)::date::text as created_at," +
                    " count(distinct case when nz_txn_type = 'DEPOSIT' then player_id end) as deposit_count," +
                    " COALESCE(sum(case when nz_txn_type = 'DEPOSIT' then amount::decimal end),0) as DEPOSIT," +
                    " count(distinct case when nz_txn_type = 'DEBIT' and nz_txn_event != 'EXPIRED' then player_id end) as debit_count," +
                    " coalesce(sum(case when nz_txn_type = 'DEBIT' and nz_txn_event != 'EXPIRED' then amount::decimal + cash_bonus end),0) as DEBIT," +
                    " count(distinct case when nz_txn_type = 'CREDIT' then player_id end) as credit_count," +
                    " coalesce(sum(case when nz_txn_type = 'CREDIT' then amount::decimal + cash_bonus end),0) as CREDIT," +
                    " count(distinct case when nz_txn_type = 'WITHDRAW' then player_id end) as withdraw_count," +
                    " COALESCE(sum(case when nz_txn_type = 'WITHDRAW' then amount::decimal end),0) as WITHDRAW," +
                    " sum(amount::decimal) as total" +
                    " from tbl_wallet_transaction " +
                    " where nz_txn_status = 'SUCCESS'" +
                    " and (created_at + 330::double precision * '00:01:00'::interval)::date between $1 and $2" +
                    " group by (created_at + 330::double precision * '00:01:00'::interval)::date::text" +
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
                let queryText = "select created_at::date::text as created_at, pg_source, nz_txn_status, count(1) as pcount, sum(amount::decimal) as total" +
                    " from tbl_wallet_transaction" +
                    " where nz_txn_type = 'DEPOSIT'" +
                    " and amount ~ '^[0-9\.]+$' = true" +
                    " and created_at::date between $1 and $2" +
                    " group by created_at::date::text, pg_source, nz_txn_status" +
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
                let queryText = "select created_at::date::text as created_at, pg_source, nz_txn_status,player_id, mobile_no, amount from tbl_wallet_transaction" +
                    " where nz_txn_type = 'DEPOSIT'" +
                    " and amount ~ '^[0-9\.]+$' = true" +
                    " and created_at::date = $1" +
                    " and pg_source = $2" +
                    " and nz_txn_status = $3" +
                    " order by created_at::date::text";

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
            " coalesce( sum(case when nz_txn_type = 'DEBIT' and nz_txn_event != 'EXPIRED' then amount::decimal else 0 end),0) as debit," +
            " coalesce( sum(case when nz_txn_type = 'CREDIT' then amount::decimal else 0 end ),0) as credit, " +
            " coalesce( sum(case when nz_txn_type = 'DEPOSIT' then amount::decimal else 0 end),0) as deposit, " +
            " coalesce( sum(case when nz_txn_type = 'WITHDRAW' then amount::decimal else 0 end),0) as withdraw , " +
            " coalesce( sum(case when nz_txn_type = 'REFUND' then amount::decimal else 0 end),0) as refund " +
            " from tbl_wallet_transaction  " +
            " where created_at::date = (now() + (330 * '1m'::interval))::date  and  nz_txn_status = 'SUCCESS' ";
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
    cashFlowSummary: async function (req, res) {
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
                queryText = "select (created_at + (330 * '1m'::interval))::date as created_at," +
                    " coalesce(sum(case when nz_txn_type = 'DEBIT' and nz_txn_event != 'EXPIRED' then amount::decimal + cash_bonus end),0) as debit," +
                    " coalesce(sum(case when nz_txn_type = 'DEBIT' and nz_txn_event = 'EXPIRED' then amount::decimal + cash_bonus end),0) as expired," +
                    " coalesce(sum(case when nz_txn_type = 'CREDIT' then amount::decimal + cash_bonus end),0) as credit," +
                    " coalesce(sum(case when nz_txn_type = 'CREDIT' and nz_txn_event = 'CONTEST-WIN' then amount::decimal end), 0) as cash_win_amount," +
                    " coalesce(sum(case when nz_txn_type = 'CREDIT' and nz_txn_event = 'CONTEST-REFUND' then amount::decimal end), 0) as contest_refund_amount," +
                    " coalesce(sum(case when nz_txn_type = 'CREDIT' and nz_txn_event = 'CONTEST-WIN' then cash_bonus end), 0) as reward_win_amount," +
                    " coalesce(sum(case when nz_txn_type = 'CREDIT' and upper(nz_txn_event) = 'REFUND' then amount::decimal + cash_bonus end), 0) as refund," +
                    " coalesce(sum(case when nz_txn_type = 'CREDIT' and upper(nz_txn_event) = 'DEPOSITBONUS' then cash_bonus end), 0) as depositbonus," +
                    " coalesce(sum(case when nz_txn_type = 'CREDIT' and upper(nz_txn_event) = 'REGISTRATION' then cash_bonus end), 0) as registration," +
                    " coalesce(sum(case when nz_txn_type = 'CREDIT' and upper(nz_txn_event) = 'REFERRER' then cash_bonus end), 0) as referrer," +
                    " coalesce(sum(case when nz_txn_type = 'CREDIT' and upper(nz_txn_event) = 'DAILY-BONUS' then cash_bonus end),0) as daily_bonus," +
                    " (coalesce(sum(case when nz_txn_type = 'DEBIT' and nz_txn_event != 'EXPIRED' then amount::decimal + cash_bonus end),0) - coalesce(sum(case when nz_txn_type = 'CREDIT' and nz_txn_event in('CONTEST-WIN','CONTEST-REFUND') then amount::decimal end), 0)) as pl" +
                    " from tbl_wallet_transaction" +
                    " where nz_txn_status = 'SUCCESS'" +
                    " and (created_at + (330 * '1m'::interval))::date between $1 and $2" +
                    " group by (created_at + (330 * '1m'::interval))::date" +
                    " order by 1";

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
    getWithdrawDepositReport: async function (req, res) {
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
                let player_id = req.body.player_id
                let phone_number = req.body.phone_number;
                let full_name = req.body.full_name;
                let range = req.body.range;
                let query = `SELECT
                wallet_transaction.created_at,
                wallet_transaction.player_id,
                tbl_player.phone_number,
                full_name,
                SUM(deposit) as deposit,
                SUM(withdraw) as withdraw,
                SUM(cash_bonus) cash_bonus
            FROM
                (
                SELECT
                    (created_at + (330 * '1m'::INTERVAL))::DATE AS created_at,
                    player_id,
                    0 AS deposit,
                    0 AS withdraw,
                    cash_bonus
                FROM
                    tbl_wallet_transaction
                WHERE
                    nz_txn_type = 'CREDIT'
                    AND UPPER(nz_txn_event) = 'DEPOSITBONUS'
            UNION ALL
                SELECT
                    (created_at + (330 * '1m'::INTERVAL))::DATE AS created_at,
                    player_id,
                    amount::DECIMAL AS deposit,
                    0 AS withdraw,
                    0 AS cash_bonus
                FROM
                    tbl_wallet_transaction
                WHERE
                    nz_txn_status = 'SUCCESS'
                    AND nz_txn_type = 'DEPOSIT'
            UNION ALL
                SELECT
                    (created_at + (330 * '1m'::INTERVAL))::DATE AS created_at,
                    player_id,
                    0 AS deposit,
                    amount::DECIMAL AS withdraw,
                    0 AS cash_bonus
                FROM
                    tbl_wallet_transaction
                WHERE
                    nz_txn_status = 'SUCCESS'
                    AND nz_txn_type = 'WITHDRAW' ) wallet_transaction
            INNER JOIN tbl_player ON
                wallet_transaction.player_id = tbl_player.player_id
            WHERE 1 = 1`;
                if (player_id) {
                    query += ` and tbl_player.player_id = ${player_id}`;
                }
                if (phone_number) {
                    query += ` and tbl_player.phone_number = '${phone_number}'`;
                }
                if (full_name) {
                    query += ` and tbl_player.full_name ilike '%${full_name}%'`;
                }
                if (range) {
                    switch (range) {
                        case "1":
                            opt = '< 100';
                            break;
                        case "2":
                            opt = 'between 100 and 499';
                            break;
                        case "3":
                            opt = '>= 500';
                            break;
                        default:
                            break;
                    }
                    query += ` and deposit ${opt}`;
                }
                query += ` and wallet_transaction.created_at between '${fromDate}' and '${toDate}'
                    GROUP BY
                        wallet_transaction.created_at,
                        wallet_transaction.player_id,
                        tbl_player.phone_number,
                        full_name`;

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
                created_at::date::text as created_at,
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
            created_at::date::text,
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

            let query = "select report_date::date::text, balance_type, balance_range, players, amount" + " from tbl_balance_range where 1 = 1";

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
    totalBalancereport: async function (req, res) {

        try {
            queryText = "select sum(winning_balance) as winning_balance, sum(reward_balance) as reward_balance, sum(deposit_balance) as deposit_balance, sum(bonus) as coin" +
                " from tbl_wallet_balance" +
                " inner join tbl_bonus" +
                " on tbl_wallet_balance.player_id = tbl_bonus.player_id";

            let query = {
                text: queryText
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
                queryText = "select reg_date::text,trans_date::text, total_register, " + column_name +
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
                queryText = "select reg_date::text,trans_date::text, total_register, " + column_name +
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
    },
    sourceRetentionReport: async function (req, res) {
        let rules = {
            "frmdate": 'required',
            "source": 'required',
            "column_name": 'required'
        };

        let validation = new services.validator(req.body, rules);
        try {
            if (validation.passes()) {
                console.log(req.body)
                let fromDate = req.body.frmdate;
                let source = req.body.source;
                let column_name = req.body.column_name;
                queryText = "select reg_date::text,trans_date::text, total_register, " + column_name +
                    " from tbl_user_funnel_source" +
                    " where source = '" + source + "'" +
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
    },

    getAllSource: async function (req, res) {

        let _selectQuery = `select distinct source from tbl_user_funnel_source order by 1`
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

    uniquePlayersJoined: async function (req, res) {
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
                queryText = "select count(distinct players.player_id) as unique_players" +
                    " from tbl_contest_players players " +
                    " join tbl_contest contest on " +
                    " contest.contest_id = players.contest_id" +
                    " where contest.start_date::date between $1 and $2";
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