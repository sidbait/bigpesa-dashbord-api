const pgConnection = require('../../model/pgConnection');
const services = require('../../service/service');

const customMsgType = "MASTER_MESSAGE";
const customMsgTypeCM = "COMMON_MESSAGE";

module.exports = {

    cashSummary: async function (req, res) {
        let days = req.body.days ? req.body.days : 6;
        let _selectQuery = `select
        created_at::date::string,
        coalesce(sum(case when nz_txn_type = 'DEPOSIT' then amount::decimal end),
        0) as DEPOSIT,
        coalesce(sum(case when nz_txn_type = 'DEBIT' then amount::decimal end),
        0) as DEBIT,
        coalesce(sum(case when nz_txn_type = 'CREDIT' then amount::decimal end),
        0) as CREDIT,
        coalesce(sum(case when nz_txn_type = 'WITHDRAW' then amount::decimal end),
        0) as WITHDRAW,
        sum(amount::decimal) as total
    from
        tbl_wallet_transaction
    where
        nz_txn_status = 'SUCCESS'
        and created_at > current_date - interval '${days} days'
    group by
        created_at::date
    order by
        created_at desc`;

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

    registeredVerifiedNotPlayed: async function (req, res) {

        let _selectQuery = `select
        sum(total_registered) as total_registered,
        sum(total_otp_verified) as total_otp_verified,
        sum(verified_but_not_played) as verified_but_not_played
    from
        (
        select
            count(distinct player_id) as total_registered,
            count(distinct case when phone_number_verified = true then player_id end) as total_otp_verified ,
            0 as verified_but_not_played
        from
            tbl_player
    union all
        select
            0 as total_registered,
            0 as total_otp_verified,
            count(1) as verified_but_not_played
        from
            tbl_player
        left join tbl_contest_players on
            tbl_player.player_id = tbl_contest_players.player_id
        where
            tbl_contest_players.player_id is null
            and tbl_player.phone_number_verified = true ) t_one
    `;

        try {
            let dbResult = await pgConnection.executeQuery('rmg_dev_db', _selectQuery)

            if (dbResult && dbResult.length > 0) {
                services.sendResponse.sendWithCode(req, res, dbResult[0], customMsgType, "GET_SUCCESS");
            } else {
                services.sendResponse.sendWithCode(req, res, dbResult, customMsgType, "GET_FAILED");
            }
        }
        catch (error) {
            services.sendResponse.sendWithCode(req, res, error, customMsgTypeCM, "DB_ERROR");
        }
    },

    registeredVerifiedNotPlayedDayWise: async function (req, res) {
        let days = req.body.days ? req.body.days : 7;
        let _selectQuery = `select
        created_at::date,
        sum(total_registered) as total_registered,
        sum(total_otp_verified) as total_otp_verified,
        sum(verified_but_not_played) as verified_but_not_played
    from
        (
        select
            created_at::date,
            count(distinct player_id) as total_registered,
            count(distinct case when phone_number_verified = true then player_id end) as total_otp_verified ,
            0 as verified_but_not_played
        from
            tbl_player
        group by
            created_at::date
    union all
        select
            created_at::date,
            0 as total_registered,
            0 as total_otp_verified,
            count(1) as verified_but_not_played
        from
            tbl_player
        left join tbl_contest_players on
            tbl_player.player_id = tbl_contest_players.player_id
        where
            tbl_contest_players.player_id is null
            and tbl_player.phone_number_verified = true
        group by
            created_at::date) t_one
    where
        created_at::date > current_date - interval '${days} days'
    group by
        created_at::date
    order by
        created_at::date desc
    `;

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

    todaysCashSummary: async function (req, res) {

        let _selectQuery = `select COALESCE(sum(case when nz_txn_type = 'DEPOSIT' then amount::decimal end),0) as total_cash_deposit,
        COALESCE(sum(case when nz_txn_type = 'DEBIT' then amount::decimal end),0) as total_cash_debit,
        COALESCE(sum(case when nz_txn_type = 'CREDIT' then amount::decimal end),0) as total_cash_credit,
        COALESCE(sum(case when nz_txn_type = 'WITHDRAW' then amount::decimal end),0) as total_cash_withdraw
        from tbl_wallet_transaction 
        where nz_txn_status = 'SUCCESS'`;

        try {
            let dbResult = await pgConnection.executeQuery('rmg_dev_db', _selectQuery)

            if (dbResult && dbResult.length > 0) {
                console.log(dbResult[0]);

                services.sendResponse.sendWithCode(req, res, dbResult[0], customMsgType, "GET_SUCCESS");
            } else {
                services.sendResponse.sendWithCode(req, res, dbResult, customMsgType, "GET_FAILED");
            }
        }
        catch (error) {
            services.sendResponse.sendWithCode(req, res, error, customMsgTypeCM, "DB_ERROR");
        }
    },

    todaysDownloadSummary: async function (req, res) {

        let _selectQuery = `select
            app_download.agency_source,
            count(distinct app_download.download_id) as downloads,
            count(distinct player_device.device_id) as register,
            count(distinct case when player.phone_number_verified = true then player_device.player_id end) as otp_verified
        from
            tbl_app_download app_download
        left join tbl_player_device player_device on
            player_device.device_id = app_download.device_id
        left join tbl_player player on
            player.player_id = player_device.player_id
        where
            app_download.download_date::date = current_date
        group by
            app_download.agency_source
        order by
	        downloads desc`;

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

    todaysCounts: async function (req, res) {

        let _selectQuery = `select date,
        sum(cash_players_joined) as cash_players_joined, 
        sum(coin_players_joined) as coin_players_joined,
        sum(cash_contest) as cash_contest, 
        sum(coin_contest) as coin_contest,
        sum(win_coin) as win_coin,
        sum(win_cash) as win_cash from (
        select
        contest.start_date::date::string as date,
        contest.debit_type, entry_fee,
        coalesce(count (distinct case contest.debit_type when 'CASH' then players.player_id end), 0) as cash_players_joined,
        coalesce(count (distinct case contest.debit_type when 'COIN' then players.player_id end), 0) as coin_players_joined,
        coalesce(count (distinct case contest.debit_type when 'CASH' then players.contest_id end), 0) as cash_contest,
        coalesce(count (distinct case contest.debit_type when 'COIN' then players.contest_id end), 0) as coin_contest,
        coalesce(sum(case when winner.credit_type = 'COIN' then winner.win_amount end), 0) as win_coin,
        coalesce(sum(case when winner.credit_type = 'CASH' then winner.win_amount end), 0) as win_cash
        from tbl_contest as contest
        inner join tbl_contest_players as players on contest.contest_id = players.contest_id
        left join tbl_contest_winner as winner on (winner.contest_id = contest.contest_id) 
        and (winner.player_id = players.player_id)
        --and contest.debit_type = 'CASH'
        group by 
        contest.start_date::date,
        contest.debit_type, entry_fee
        ) game_contest
        where date::date = current_date
        group by date`;

        try {
            let dbResult = await pgConnection.executeQuery('rmg_dev_db', _selectQuery)

            if (dbResult && dbResult.length > 0) {
                console.log(dbResult[0]);

                services.sendResponse.sendWithCode(req, res, dbResult[0], customMsgType, "GET_SUCCESS");
            } else {
                services.sendResponse.sendWithCode(req, res, dbResult, customMsgType, "GET_FAILED");
            }
        }
        catch (error) {
            services.sendResponse.sendWithCode(req, res, error, customMsgTypeCM, "DB_ERROR");
        }
    },

    todaysCountsDebitCredit: async function (req, res) {

        let _selectQuery = `select created_at::date::string,
        count(case when nz_txn_type = 'DEPOSIT' then 1 end) as deposit_count,
        COALESCE(sum(case when nz_txn_type = 'DEPOSIT' then amount::decimal end),0) as DEPOSIT,
        count(case when nz_txn_type = 'DEBIT' then 1 end) as DEBIT_count,
        COALESCE(sum(case when nz_txn_type = 'DEBIT' then amount::decimal end),0) as DEBIT,
        count(case when nz_txn_type = 'CREDIT' then 1 end) as CREDIT_count,
        COALESCE(sum(case when nz_txn_type = 'CREDIT' then amount::decimal end),0) as CREDIT,
        count(case when nz_txn_type = 'WITHDRAW' then 1 end) as WITHDRAW_count,
        COALESCE(sum(case when nz_txn_type = 'WITHDRAW' then amount::decimal end),0) as WITHDRAW
        from tbl_wallet_transaction 
        where nz_txn_status = 'SUCCESS'
        and created_at::date = current_date
        group by created_at::date::string
        order by 1`;

        try {
            let dbResult = await pgConnection.executeQuery('rmg_dev_db', _selectQuery)

            if (dbResult && dbResult.length > 0) {
                console.log(dbResult[0]);

                services.sendResponse.sendWithCode(req, res, dbResult[0], customMsgType, "GET_SUCCESS");
            } else {
                services.sendResponse.sendWithCode(req, res, dbResult, customMsgType, "GET_FAILED");
            }
        }
        catch (error) {
            services.sendResponse.sendWithCode(req, res, error, customMsgTypeCM, "DB_ERROR");
        }
    },
}