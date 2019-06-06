const pgConnection = require('../../model/pgConnection');

let expiretime = 15 * 60 // in sec // 15 min

module.exports = {
    setDashboardRedis: async () => {
        console.log('setDashboardRedis.........');

        setInterval(() => {
            inactiveUsersWithCashCoin(expiretime);
            cashSummary(expiretime);
            registeredVerifiedNotPlayed(expiretime);
            registeredVerifiedNotPlayedDayWise(expiretime);
            totalCashSummary(expiretime);
            // todaysDownloadSummary(expiretime);
            todaysCounts(expiretime);
            todaysCountsDebitCredit(expiretime);
            totalUsersWithCashCoin(expiretime);
            activeUsersWithCashCoin(expiretime);
        }, 16 * 60 * 1000);
    }
}

function todaysCountsDebitCredit(expiretime) {
    let _selectQuery = `select created_at::date::text,
    count(case when nz_txn_type = 'DEPOSIT' then 1 end) as deposit_count,
    COALESCE(sum(case when nz_txn_type = 'DEPOSIT' then amount::decimal end),0) as DEPOSIT,
    count(case when nz_txn_type = 'DEBIT' and nz_txn_event not in( 'EXPIRED','BONUS_MIGRATION') then 1 end) as DEBIT_count,
    coalesce(sum(case when nz_txn_type = 'DEBIT' and nz_txn_event not in( 'EXPIRED','BONUS_MIGRATION') then amount::decimal + cash_bonus end),0) DEBIT,
    count(case when nz_txn_type = 'CREDIT' then 1 end) as CREDIT_count,
    coalesce(sum(case when nz_txn_type = 'CREDIT' then amount::decimal + cash_bonus end),0) as CREDIT,
    count(case when nz_txn_type = 'WITHDRAW' then 1 end) as WITHDRAW_count,
    COALESCE(sum(case when nz_txn_type = 'WITHDRAW' then amount::decimal end),0) as WITHDRAW
    from tbl_wallet_transaction 
    where nz_txn_status = 'SUCCESS'
    and created_at::date = (now()::timestamptz + (330::int * '1m'::interval))::date
    group by created_at::date::text
    order by 1`;
    let x = runQuery(_selectQuery,expiretime);
}

function activeUsersWithCashCoin(expiretime) {
    let _selectQuery = `select
    count(player.player_id) as active_users,
    sum(winning_balance) as winning_cash,
    sum(reward_balance) as reward_cash,
    sum(deposit_balance) as deposit_cash
    from (
    select distinct player_id
    from tbl_contest_players) as player 
    inner join tbl_wallet_balance as cash on player.player_id = cash.player_id`;
    let x = runQuery(_selectQuery,expiretime);
}

function totalUsersWithCashCoin(expiretime) {
    let _selectQuery = `select count(player.player_id) as verfied_users,
    sum(winning_balance) as winning_cash, sum(reward_balance) as reward_cash,
    sum(deposit_balance) as deposit_cash
    from tbl_player as player
    inner join tbl_wallet_balance as cash on player.player_id = cash.player_id
    where phone_number_verified = true`;
    let x = runQuery(_selectQuery,expiretime);
}

function cashSummary(expiretime) {
    let _selectQuery = `select
    *
from
    vv_admin_cash_flow_summary
where
    report_date::date > (now() + (330 * '1m'::interval))::date - interval '7 days'
order by report_date::date desc`;
    let x = runQuery(_selectQuery,expiretime);
}

function registeredVerifiedNotPlayed(expiretime) {
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
    left join (
        select
            player_id
        from
            tbl_contest_players
    union all
        select
            player_id
        from
            tbl_contest_players_backup
    union all
        select
            player_id
        from
            tbl_player_contest_25_02_2019) as contest_players on
        tbl_player.player_id = contest_players.player_id
    where
        contest_players.player_id is null
        and tbl_player.phone_number_verified = true ) t_one`;
    let x = runQuery(_selectQuery,expiretime);
}

function registeredVerifiedNotPlayedDayWise(expiretime) {
    let days = 7;
    let _selectQuery = `SELECT
    report_date,
    SUM(total_registered) AS total_registered,
    SUM(playstore_register) AS playstore_register,
    SUM(pro_register) AS pro_register,
    SUM(total_otp_verified) AS total_otp_verified,
    SUM(playstore_verified) AS playstore_verified,
    SUM(pro_verified) AS pro_verified,
    SUM(verified_but_not_played) AS verified_but_not_played
FROM
    (
    SELECT
        (created_at + (330 * '1m'::INTERVAL))::DATE AS report_date,
        COUNT(DISTINCT player_id) AS total_registered,
        COUNT( CASE WHEN UPPER(channel) IN('PLAYSTORE') THEN player_id END) AS playstore_register,
        COUNT( CASE WHEN UPPER(channel) NOT IN('PLAYSTORE') THEN player_id END) AS pro_register,
        COUNT(DISTINCT CASE WHEN phone_number_verified = TRUE THEN player_id END) AS total_otp_verified ,
        COUNT( CASE WHEN UPPER(channel) IN('PLAYSTORE') AND phone_number_verified = TRUE THEN player_id END) AS playstore_verified,
        COUNT( CASE WHEN UPPER(channel) NOT IN('PLAYSTORE') AND phone_number_verified = TRUE THEN player_id END) AS pro_verified,
        0 AS verified_but_not_played
    FROM
        tbl_player
    WHERE
        (created_at + (330 * '1m'::INTERVAL))::DATE > (now() + (330 * '1m'::INTERVAL))::DATE - INTERVAL '${days} days'
    GROUP BY
        (created_at + (330 * '1m'::INTERVAL))::DATE
UNION ALL
    SELECT
        (created_at + (330 * '1m'::INTERVAL))::DATE AS report_date,
        0 AS total_registered,
        0 AS playstore_register,
        0 AS pro_register,
        0 AS total_otp_verified,
        0 AS playstore_verified,
        0 AS pro_verified,
        COUNT(1) AS verified_but_not_played
    FROM
        tbl_player
    LEFT JOIN tbl_contest_players AS contest_players ON
        tbl_player.player_id = contest_players.player_id
    WHERE
        contest_players.player_id IS NULL
        AND tbl_player.phone_number_verified = TRUE
        AND (created_at + (330 * '1m'::INTERVAL))::DATE > (now() + (330 * '1m'::INTERVAL))::DATE - INTERVAL '${days} days'
    GROUP BY
        (created_at + (330 * '1m'::INTERVAL))::DATE ) t_one
GROUP BY
    report_date
ORDER BY
    report_date`;
    let x = runQuery(_selectQuery,expiretime);
}

function totalCashSummary(expiretime) {
    let _selectQuery = `select COALESCE(sum(case when nz_txn_type = 'DEPOSIT' then amount::decimal end),0) as total_cash_deposit,
    coalesce(sum(case when nz_txn_type = 'DEBIT' and nz_txn_event not in( 'EXPIRED','BONUS_MIGRATION') then amount::decimal + cash_bonus end),0) as total_cash_debit,
    coalesce(sum(case when nz_txn_type = 'CREDIT' then amount::decimal + cash_bonus end),0) as total_cash_credit,
    COALESCE(sum(case when nz_txn_type = 'WITHDRAW' then amount::decimal end),0) as total_cash_withdraw
    from tbl_wallet_transaction 
    where nz_txn_status = 'SUCCESS'`;
    let x = runQuery(_selectQuery,expiretime);
}

function todaysDownloadSummary(expiretime) {
    console.log('todaysDownloadSummary..');
    
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
        0::decimal::decimal as register,
        0::decimal::decimal as otp_verified
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
        0::decimal::decimal as downloads,
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
    let x = runQuery(_selectQuery,expiretime);
}

function todaysCounts(expiretime) {
    let _selectQuery = `select date,
    sum(cash_players_joined) as cash_players_joined, 
    sum(coin_players_joined) as coin_players_joined,
    sum(cash_contest) as cash_contest, 
    sum(coin_contest) as coin_contest,
    sum(win_coin) as win_coin,
    sum(win_cash) as win_cash from (
    select
    contest.start_date::date::text as date,
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
    where date::date = (now()::timestamptz + (330::int * '1m'::interval))::date
    group by date`;
    let x = runQuery(_selectQuery,expiretime);
}

function inactiveUsersWithCashCoin(expiretime) {
    let _selectQuery = `select
        count(distinct player.player_id) as inactive_users,
        sum(winning_balance) as winning_cash,
        sum(reward_balance) as reward_cash,
        sum(deposit_balance) as deposit_cash
        from tbl_player as player
        inner join tbl_wallet_balance as cash on player.player_id = cash.player_id
        left join (
            select
                player_id
            from
                tbl_contest_players
        union all
            select
                player_id
            from
                tbl_contest_players_backup
        union all
            select
                player_id
            from
                tbl_player_contest_25_02_2019) as contest_players on player.player_id = contest_players.player_id
        where
        contest_players.player_id is null
        and phone_number_verified = true`;


    let x = runQuery(_selectQuery,expiretime);
}

async function runQuery(query,expiretime) {
    try {
        let dbResult = await pgConnection.executeQuery('rmg_dev_db', query, true, expiretime)
    }
    catch (error) {
        console.log(error);
    }
}