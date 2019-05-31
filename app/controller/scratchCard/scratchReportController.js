const pgConnection = require('../../model/pgConnection');

const services = require('../../service/service');
const jsonToPivotjson = require("json-to-pivot-json");

const customMsgType = "MASTER_MESSAGE";
const customMsgTypeCM = "COMMON_MESSAGE";

module.exports = {

    getScratchSummary: async function (req, res) {

        //let _camp_id = req.body.camp_id ? req.body.camp_id : null;

        let _selectQuery = `select prize_code, prize_type,
        amount, count(1) total,
        count(case when is_win = false then 1 end) avaialble,
        count(case when is_win = true then 1 end) won,
        count(case when is_claim = true then 1 end) claimed,
        count(case when is_credited = true then 1 end) credited
         from tbl_scratch_campaign_prizes_details 
        join tbl_scratch_prize_master
        on tbl_scratch_campaign_prizes_details.prize_id = tbl_scratch_prize_master.prize_id
        group by prize_code, prize_type,amount`;

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

        let _selectQuery = `select case when tbl_scratch_campaign_prizes_details.winner_date is null then '--' else tbl_scratch_campaign_prizes_details.winner_date::date::text end  as winner_date, prize_code, prize_type,
            count(case when is_win = true then 1 end)  as win_count,
             sum(case when is_win = true then amount end) as total_amount
             from tbl_scratch_campaign_prizes_details 
            join tbl_scratch_prize_master
            on tbl_scratch_campaign_prizes_details.prize_id = tbl_scratch_prize_master.prize_id
            group by case when tbl_scratch_campaign_prizes_details.winner_date is null then '--' else tbl_scratch_campaign_prizes_details.winner_date::date::text end, prize_code, prize_type`;

        try {
            let dbResult = await pgConnection.executeQuery('rmg_dev_db', _selectQuery)

            console.log('dbResult - ', dbResult);


            if (dbResult && dbResult.length > 0) {
                let options = {
                    row: "winner_date",
                    column: "prize_code",
                    value: "win_count"
                };
                let output = jsonToPivotjson(dbResult, options);

                console.log('output - ', output)

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