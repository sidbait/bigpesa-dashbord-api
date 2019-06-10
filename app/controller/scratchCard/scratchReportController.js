const pgConnection = require('../../model/pgConnection');

const services = require('../../service/service');
const jsonToPivotjson = require("json-to-pivot-json");

const customMsgType = "MASTER_MESSAGE";
const customMsgTypeCM = "COMMON_MESSAGE";

module.exports = {

    getScratchSummary: async function (req, res) {

        let _camp_id = req.body.camp_id ? req.body.camp_id : null;
        let _frmdate = req.body.frmdate ? req.body.frmdate : null;
        let _todate = req.body.todate ? req.body.todate : _frmdate;
        let column_name = req.body.column_name ? req.body.column_name : null;
        let group_by = ' prize_code, prize_type';

        if (_frmdate) {
            group_by = ' from_date::date::text, to_date::date::text, prize_type'
        } 
        
        if (_frmdate && column_name == 'prize_code') {
            group_by = ' from_date::date::text, to_date::date::text, prize_code'
        }


        let _selectQuery = `select ${group_by},
        amount, count(1) avaialble,
        (amount * count(1)) total_amount,
        count(case when is_win = false then 1 end) remaining,
        count(case when is_win = true then 1 end) won,
        count(case when is_claim = true then 1 end) claimed,
        count(case when is_credited = true then 1 end) credited
            from tbl_scratch_campaign_prizes_details 
        join tbl_scratch_prize_master
        on tbl_scratch_campaign_prizes_details.prize_id = tbl_scratch_prize_master.prize_id`

        if (_camp_id) {
            _selectQuery += ` where tbl_scratch_campaign_prizes_details.camp_id = ${_camp_id}`
        }

        if (_frmdate) {
            _selectQuery += ` where tbl_scratch_campaign_prizes_details.from_date between '${_frmdate}' and '${_todate}'`
        }

        _selectQuery += ` group by ${group_by}, amount 
        order by 1, 2, 3`;

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

    scratchWonReport: async function (req, res) {

        console.log(req.body)
        let _camp_id = req.body.camp_id ? req.body.camp_id : null;
        let _frmdate = req.body.frmdate ? req.body.frmdate : null;
        let _todate = req.body.todate ? req.body.todate : _frmdate;
        let column_name = req.body.column_name ? req.body.column_name : 'prize_type';
        let value_of = req.body.value_of ? req.body.value_of : 'win_count';

        let _selectQuery = `select case when tbl_scratch_campaign_prizes_details.winner_date is null then '--' else tbl_scratch_campaign_prizes_details.winner_date::date::text end  as winner_date, prize_code, prize_type,
            count(case when is_win = true then 1 end) as win_count,
            sum(case when is_win = true then amount end) as win_amount,
            count(case when is_claim = true then 1 end) claimed_count,
            sum(case when is_claim = true then amount end) claimed_amount,
            count(case when is_credited = true then 1 end) credited_count,
            sum(case when is_credited = true then amount end) credited_amount
            from tbl_scratch_campaign_prizes_details 
            join tbl_scratch_prize_master
            on tbl_scratch_campaign_prizes_details.prize_id = tbl_scratch_prize_master.prize_id`;

            if (_camp_id) {
                _selectQuery += ` where tbl_scratch_campaign_prizes_details.camp_id = ${_camp_id}`
            }

            if (_frmdate) {
                _selectQuery += ` where tbl_scratch_campaign_prizes_details.from_date between '${_frmdate}' and '${_todate}'`
            }

            _selectQuery += ` group by case when tbl_scratch_campaign_prizes_details.winner_date is null then '--' else tbl_scratch_campaign_prizes_details.winner_date::date::text end, prize_code, prize_type`;

        try {
            let dbResult = await pgConnection.executeQuery('rmg_dev_db', _selectQuery)

            //console.log('dbResult - ', dbResult);


            if (dbResult && dbResult.length > 0) {
                let options = {
                    row: "winner_date",
                    column: column_name,
                    value: value_of
                };
                let output = jsonToPivotjson(dbResult, options);

                //console.log('output - ', output)

                services.sendResponse.sendWithCode(req, res, output, customMsgType, "GET_SUCCESS");
            } else {
                services.sendResponse.sendWithCode(req, res, dbResult, customMsgType, "GET_FAILED");
            }
        }
        catch (error) {
            services.sendResponse.sendWithCode(req, res, error, customMsgTypeCM, "DB_ERROR");
        }
    },
}