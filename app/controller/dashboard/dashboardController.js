const pgConnection = require('../../model/pgConnection');
const services = require('../../service/service');

const customMsgType = "MASTER_MESSAGE";
const customMsgTypeCM = "COMMON_MESSAGE";
let expiretime = 15*60 // in sec //
module.exports = {

    cashSummary: async function (req, res) {
        let days = req.body.days ? req.body.days : 6;
        let _selectQuery = `select
        (created_at + (330 * '1m'::interval))::date as report_date,
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
        and (created_at + (330 * '1m'::interval))::date > (now() + (330 * '1m'::interval))::date - interval '${days} days'
    group by
        (created_at + (330 * '1m'::interval))::date
    order by
        (created_at + (330 * '1m'::interval))::date desc`;

        try {
            let dbResult = await pgConnection.executeQuery('rmg_dev_db', _selectQuery, true, expiretime)

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
            let dbResult = await pgConnection.executeQuery('rmg_dev_db', _selectQuery, true, expiretime)

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
        report_date,
        sum(total_registered) as total_registered,
        sum(total_otp_verified) as total_otp_verified,
        sum(verified_but_not_played) as verified_but_not_played
    from
        (
        select
            (created_at + (330 * '1m'::interval))::date as report_date,
            count(distinct player_id) as total_registered,
            count(distinct case when phone_number_verified = true then player_id end) as total_otp_verified ,
            0 as verified_but_not_played
        from
            tbl_player
        where
            (created_at + (330 * '1m'::interval))::date > (now() + (330 * '1m'::interval))::date - interval '${days} days'
        group by
            (created_at + (330 * '1m'::interval))::date
    union all
        select
            (created_at + (330 * '1m'::interval))::date as report_date,
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
            and (created_at + (330 * '1m'::interval))::date > (now() + (330 * '1m'::interval))::date - interval '${days} days'
        group by
            (created_at + (330 * '1m'::interval))::date ) t_one
    group by
        report_date
    order by
        report_date desc
    `;
        try {
            let dbResult = await pgConnection.executeQuery('rmg_dev_db', _selectQuery, true, expiretime)

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

    totalCashSummary: async function (req, res) {

        let _selectQuery = `select COALESCE(sum(case when nz_txn_type = 'DEPOSIT' then amount::decimal end),0) as total_cash_deposit,
        COALESCE(sum(case when nz_txn_type = 'DEBIT' then amount::decimal end),0) as total_cash_debit,
        COALESCE(sum(case when nz_txn_type = 'CREDIT' then amount::decimal end),0) as total_cash_credit,
        COALESCE(sum(case when nz_txn_type = 'WITHDRAW' then amount::decimal end),0) as total_cash_withdraw
        from tbl_wallet_transaction 
        where nz_txn_status = 'SUCCESS'`;

        try {
            let dbResult = await pgConnection.executeQuery('rmg_dev_db', _selectQuery, true, expiretime)

            if (dbResult && dbResult.length > 0) {
                // console.log(dbResult[0]);

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
        xsource as xsource,
        sum(downloads) as downloads,
        sum(register) as register,
        sum(otp_verified) as otp_verified
    from
        (
        select
            case
                when agency_source like 'refer%' then 'Referrer'
                when agency_source = '' then 'Unknown'
                else agency_source
            end as xsource,
            count(distinct download_id)::decimal as downloads,
            0:::decimal::decimal as register,
            0:::decimal::decimal as otp_verified
        from
            tbl_app_download
        where
            (download_date + (330 * '1m'::interval))::date = (now() + (330 * '1m'::interval))::date
        group by
            agency_source
    union all
        select
            case
                when source like 'refer%' then 'Referrer'			
                when source  = '' then 'Unknown'
                else source
            end as xsource,
            0:::decimal::decimal as downloads,
            count(player_id)::decimal as register,
            count(distinct case when phone_number_verified = true then player_id end)::decimal as otp_verified
        from
            tbl_player
        where
            (created_at + (330 * '1m'::interval))::date = (now() + (330 * '1m'::interval))::date
        group by
            source)
    group by
        xsource
    order by downloads desc`;

        try {
            let dbResult = await pgConnection.executeQuery('rmg_dev_db', _selectQuery, true, expiretime)

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
//need to chnage
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
        where date::date = (now():::timestamptz + (330:::int * '1m':::interval))::date
        group by date`;

        try {
            let dbResult = await pgConnection.executeQuery('rmg_dev_db', _selectQuery, true, 1800)

            if (dbResult && dbResult.length > 0) {
                // console.log(dbResult[0]);

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
        and created_at::date = (now():::timestamptz + (330:::int * '1m':::interval))::date
        group by created_at::date::string
        order by 1`;

        try {
            let dbResult = await pgConnection.executeQuery('rmg_dev_db', _selectQuery, true, expiretime)

            if (dbResult && dbResult.length > 0) {
                // console.log(dbResult[0]);

                services.sendResponse.sendWithCode(req, res, dbResult[0], customMsgType, "GET_SUCCESS");
            } else {
                services.sendResponse.sendWithCode(req, res, dbResult, customMsgType, "GET_FAILED");
            }
        }
        catch (error) {
            services.sendResponse.sendWithCode(req, res, error, customMsgTypeCM, "DB_ERROR");
        }
    },

    appWiseActiveUsers: async function (req, res) {
        let duration = req.body.duration ? req.body.duration : 'Today';
        let days = 0;
        let opt = '='
        switch (duration) {
            case 'Today':
                days = 0;
                opt = '='
                break;
            case 'Yesterday':
                days = 1;
                opt = '='
                break;
            case 'Week':
                days = 7;
                opt = '>'
                break;
            case 'Month':
                days = 30;
                opt = '>'
                break;
            default:
                break;
        }
        let _selectQuery = `select
        a.app_name,
        count(distinct player_id)
    from
        tbl_contest_players cp
    inner join tbl_contest c on cp.contest_id = c.contest_id
    inner join tbl_app a on c.app_id = a.app_id
    where
        (transaction_date + (330 * '1m'::interval))::date ${opt} (now() + (330 * '1m'::interval))::date - interval '${days} days'
    group by
        a.app_name
    order by 2 desc`;

        try {
            let dbResult = await pgConnection.executeQuery('rmg_dev_db', _selectQuery, true, expiretime)

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

    dayWiseActiveUsers: async function (req, res) {
        let duration = req.body.duration ? req.body.duration : 'Daily';

        let _selectQuery = `select trans_date, sum(register_users) as register_users, sum(verified_users) as verified_users,
        sum(active_users) as active_users, sum(paid_users) as paid_users, sum(deposit_amount) as deposit_amount
        from (
        select (created_at + (330 * '1m'::interval))::date::string as trans_date, count(player_id) as register_users, 
        count(case when phone_number_verified = true then 1 end) as verified_users,
        0 as active_users, 0 as paid_users, 0::decimal as deposit_amount
        from tbl_player 
        where (created_at + (330 * '1m'::interval))::date > ((now() + (330 * '1m'::interval))::date - interval '30 days')::date 
        group by (created_at + (330 * '1m'::interval))::date::string
        union all
        select (created_at + (330 * '1m'::interval))::date::string as trans_date, 0 as register_users, 0 as verified_users, 
        count(distinct player_id) as active_users, 0 as paid_users, 0::decimal as deposit_amount
        from tbl_wallet_transaction
        where (created_at + (330 * '1m'::interval))::date > ((now() + (330 * '1m'::interval))::date - interval '30 days')::date 
        group by (created_at + (330 * '1m'::interval))::date::string
        union all
        select (created_at + (330 * '1m'::interval))::date::string as trans_date, 0 as register_users, 0 as verified_users, 
        0 as active_users, count(distinct player_id) as paid_users, sum(amount::decimal) as deposit_amount
        from tbl_wallet_transaction
        where (created_at + (330 * '1m'::interval))::date > ((now() + (330 * '1m'::interval))::date - interval '30 days')::date and 
        nz_txn_status = 'SUCCESS' and nz_txn_type = 'DEPOSIT'
        group by (created_at + (330 * '1m'::interval))::date::string
        ) as active_users
        group by trans_date
        order by trans_date`;

        switch (duration) {
            case 'Daily':
                _selectQuery = `select trans_date, sum(register_users) as register_users, sum(verified_users) as verified_users,
                sum(active_users) as active_users, sum(paid_users) as paid_users, sum(deposit_amount) as deposit_amount
                from (
                select (created_at + (330 * '1m'::interval))::date::string as trans_date, count(player_id) as register_users, 
                count(case when phone_number_verified = true then 1 end) as verified_users,
                0 as active_users, 0 as paid_users, 0::decimal as deposit_amount
                from tbl_player 
                where (created_at + (330 * '1m'::interval))::date > ((now() + (330 * '1m'::interval))::date - interval '30 days')::date 
                group by (created_at + (330 * '1m'::interval))::date::string
                union all
                select (created_at + (330 * '1m'::interval))::date::string as trans_date, 0 as register_users, 0 as verified_users, 
                count(distinct player_id) as active_users, 0 as paid_users, 0::decimal as deposit_amount
                from tbl_wallet_transaction
                where (created_at + (330 * '1m'::interval))::date > ((now() + (330 * '1m'::interval))::date - interval '30 days')::date 
                group by (created_at + (330 * '1m'::interval))::date::string
                union all
                select (created_at + (330 * '1m'::interval))::date::string as trans_date, 0 as register_users, 0 as verified_users, 
                0 as active_users, count(distinct player_id) as paid_users, sum(amount::decimal) as deposit_amount
                from tbl_wallet_transaction
                where (created_at + (330 * '1m'::interval))::date > ((now() + (330 * '1m'::interval))::date - interval '30 days')::date and 
                nz_txn_status = 'SUCCESS' and nz_txn_type = 'DEPOSIT'
                group by (created_at + (330 * '1m'::interval))::date::string
                ) as active_users
                group by trans_date
                order by trans_date`;
                break;
            case 'Weekly':
                _selectQuery = `select trans_date, sum(register_users) as register_users, sum(verified_users) as verified_users,
                sum(active_users) as active_users, sum(paid_users) as paid_users, sum(deposit_amount) as deposit_amount
                from (
                select date_trunc('week', created_at + (330 * '1m'::interval))::date::string as trans_date, count(player_id) as register_users, 
                count(case when phone_number_verified = true then 1 end) as verified_users,
                0 as active_users, 0 as paid_users, 0::decimal as deposit_amount
                from tbl_player 
                where created_at::date > '2019-01-01' 
                group by date_trunc('week', created_at + (330 * '1m'::interval))::date::string
                union all
                select date_trunc('week',(created_at + (330 * '1m'::interval)))::date::string as trans_date, 0 as register_users, 0 as verified_users, 
                count(distinct player_id) as active_users, 0 as paid_users, 0::decimal as deposit_amount
                from tbl_wallet_transaction
                where (created_at + (330 * '1m'::interval))::date > '2019-01-01'
                group by date_trunc('week',(created_at + (330 * '1m'::interval)))::date::string
                union all
                select date_trunc('week', created_at + (330 * '1m'::interval))::date::string as trans_date, 0 as register_users, 0 as verified_users, 
                0 as active_users, count(distinct player_id) as paid_users, sum(amount::decimal) as deposit_amount
                from tbl_wallet_transaction
                where created_at::date > '2019-01-01' and 
                nz_txn_status = 'SUCCESS' and nz_txn_type = 'DEPOSIT'
                group by date_trunc('week', created_at + (330 * '1m'::interval))::date::string
                ) as active_users
                group by trans_date
                order by trans_date`
                break;
            case 'Monthly':
                _selectQuery = `select trans_date, sum(register_users) as register_users, sum(verified_users) as verified_users,
                sum(active_users) as active_users, sum(paid_users) as paid_users, sum(deposit_amount) as deposit_amount
                from (
                select date_trunc('month', created_at + (330 * '1m'::interval))::date::string as trans_date, count(player_id) as register_users, 
                count(case when phone_number_verified = true then 1 end) as verified_users,
                0 as active_users, 0 as paid_users, 0::decimal as deposit_amount
                from tbl_player 
                where created_at::date > '2019-01-01' 
                group by date_trunc('month', created_at + (330 * '1m'::interval))::date::string
                union all
                select date_trunc('month',(created_at + (330 * '1m'::interval)))::date::string as trans_date, 0 as register_users, 0 as verified_users, 
                count(distinct player_id) as active_users, 0 as paid_users, 0::decimal as deposit_amount
                from tbl_wallet_transaction
                where (created_at + (330 * '1m'::interval))::date > '2019-01-01'
                group by date_trunc('month',(created_at + (330 * '1m'::interval)))::date::string
                union all
                select date_trunc('month', created_at + (330 * '1m'::interval))::date::string as trans_date, 0 as register_users, 0 as verified_users, 
                0 as active_users, count(distinct player_id) as paid_users, sum(amount::decimal) as deposit_amount
                from tbl_wallet_transaction
                where created_at::date > '2019-01-01' and 
                nz_txn_status = 'SUCCESS' and nz_txn_type = 'DEPOSIT'
                group by date_trunc('month', created_at + (330 * '1m'::interval))::date::string
                ) as active_users
                group by trans_date
                order by trans_date`
                break;
            default:
                break;
        }


        try {
            let dbResult = await pgConnection.executeQuery('rmg_dev_db', _selectQuery, true, expiretime)

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

    totalUsersWithCashCoin: async function (req, res) {


        let _selectQuery = `select count(player.player_id) as verfied_users,
        sum(winning_balance) as winning_cash, sum(reward_balance) as reward_cash,
        sum(deposit_balance) as deposit_cash, sum(bonus) as coin
        from tbl_player as player
        left join tbl_wallet_balance as cash on player.player_id = cash.player_id 
        left join tbl_bonus as coin on player.player_id = coin.player_id
        where phone_number_verified = true`;


        try {
            let dbResult = await pgConnection.executeQuery('rmg_dev_db', _selectQuery, true, expiretime)

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

    activeUsersWithCashCoin: async function (req, res) {


        let _selectQuery = `select
        count(player.player_id) as active_users,
        sum(winning_balance) as winning_cash,
        sum(reward_balance) as reward_cash,
        sum(deposit_balance) as deposit_cash,
        sum(bonus) as coin
        from (
        select distinct player_id
        from tbl_contest_players) as player 
        left join tbl_wallet_balance as cash on player.player_id = cash.player_id 
        left join tbl_bonus as coin on player.player_id = coin.player_id`;


        try {
            let dbResult = await pgConnection.executeQuery('rmg_dev_db', _selectQuery, true, expiretime)

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

    inactiveUsersWithCashCoin: async function (req, res) {


        let _selectQuery = `select
        count(distinct player.player_id) as inactive_users,
        sum(winning_balance) as winning_cash,
        sum(reward_balance) as reward_cash,
        sum(deposit_balance) as deposit_cash,
        sum(bonus) as coin
        from tbl_player as player         
        left join tbl_contest_players as contest_players on player.player_id = contest_players.player_id
        left join tbl_wallet_balance as cash on player.player_id = cash.player_id 
        left join tbl_bonus as coin on player.player_id = coin.player_id
        where
        contest_players.player_id is null
        and phone_number_verified = true`;


        try {
            let dbResult = await pgConnection.executeQuery('rmg_dev_db', _selectQuery, true, expiretime)

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

    chkEnvironment: function (req, res) {
        console.log('<=======chkEnvironment=======>');
        let environment = ''
        if (config.db_connectionString.pg.public.host == '13.126.241.0') {
            environment = 'Staging' //staging environment
        } else {
            environment = 'Live' //Live environment
        }

        console.log(environment);

        let op = {
            environment
        }

        res.send(op)
    }
}