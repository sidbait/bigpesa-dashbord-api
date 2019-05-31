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

    chgStatus: async function (req, res) {

        let date = req.body.date;
        let status = req.body.status;
        let que_type = req.body.que_type ? req.body.que_type : '';

        if (que_type == 'CASH_WALLET_QUEUE' && status == 'PROCESSING') {

            try {
                let chkTransTblResult = await chkTransTbl(date);
                console.log('chkTransTbl result:', chkTransTblResult);
            } catch (error) {
                console.log(error);
            }

            _updateQuery = `update tbl_wallet_credit_que set status = 'ACTIVE' where status = '${status}' and is_credit = false and add_date::date = '${date}' returning que_id`;

        } else if (que_type == 'COIN_WALLET_QUEUE' && status == 'PROCESSING') {

            _updateQuery = `update tbl_bonus_credit_que set status = 'ACTIVE' where status = '${status}' and is_credit = false and add_date::date = '${date}' returning que_id`;

        } else {

            services.sendResponse.sendWithCode(req, res, 'status must be PROCESSING', customMsgType, "GET_FAILED");
        }

        try {
            let dbResult = await pgConnection.executeQuery('rmg_dev_db', _updateQuery)
            console.log(dbResult);

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

    runSQL: async function (req, res) {

        let sql_query = req.body.sql_query;
        let _run = false;

        sql_query = sql_query.toString().replace(/[\s]+/g, " ").trim();
        let words = sql_query.split(" ");
        words = words.map(function (x) { return x.toUpperCase() });
        // console.log(words);

        let casearr = ["UPDATE", "DELETE", "INSERT", "CREATE", "DROP", "ALTER"];
        _run = words.some(r => casearr.includes(r));
        // console.log(words.some(r => casearr.includes(r)));

        // console.log(words[0]);

        if (words[0] != "SELECT") {
            _run = true;
        }

        sql_query += `  limit 50 `;

        console.log('run sql stmt', _run);

        if (_run === false) {
            try {
                let dbResult = await pgConnection.executeQuery('rmg_dev_db', sql_query, false, 0, true)

                if (dbResult && dbResult.length > 0) {
                    services.sendResponse.sendWithCode(req, res, dbResult, customMsgType, "GET_SUCCESS");
                } else {
                    services.sendResponse.sendWithCode(req, res, dbResult, customMsgType, "GET_FAILED");
                }
            }
            catch (error) {
                services.sendResponse.sendWithCode(req, res, error, customMsgTypeCM, "DB_ERROR");
            }
        } else {
            services.sendResponse.sendWithCode(req, res, 'error', customMsgTypeCM, "DB_ERROR");
        }
    },

    getWalletMatrix: async function (req, res) {

        let id = req.body.id;
        let status = req.body.status;
        let matrix_code = req.body.matrix_code ? req.body.matrix_code : '';
        let _selectQuery = '';

        _selectQuery = `select matrix_id,matrix_code ,description,reward_balance,deposit_balance,winning_balance,fallback,status from tbl_wallet_debit_matrix where 1 =1 `

        if (id) {
            _selectQuery += ` and matrix_id = ${id}`
        }

        if (matrix_code) {
            _selectQuery += ` and matrix_code = '${matrix_code}'`
        }

        if (status) {
            _selectQuery += ` and status = '${status}'`
        }

        _selectQuery += ` order by matrix_code`


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

    updateMatrix: async function (req, res) {
        let rules = {
            "matrix_code": 'required',
            // "description": 'required',
            // "reward_balance": 'required',
            // "deposit_balance": 'required',
            // "winning_balance": 'required',
            // "fallback": 'required',
            "status": 'required|in:ACTIVE,DEACTIVE,PENDING',
        };

        let validation = new services.validator(req.body, rules);

        if (validation.passes()) {

            let _matrix_id = req.body.matrix_id ? req.body.matrix_id : null;
            let _matrix_code = req.body.matrix_code ? req.body.matrix_code : null;
            let _description = req.body.description ? req.body.description : null;
            let _reward_balance = req.body.reward_balance ? req.body.reward_balance : 0;
            let _deposit_balance = req.body.deposit_balance ? req.body.deposit_balance : 0;
            let _winning_balance = req.body.winning_balance ? req.body.winning_balance : 0;
            let _fallback = req.body.fallback ? req.body.fallback : null;
            let _status = req.body.status ? req.body.status : null;
            let _created_by = req.body.userid ? req.body.userid : null;
            let _updated_by = req.body.userid ? req.body.userid : null;

            let _query;
            let errMsgType = _matrix_id ? 'UPDATE_FAILED' : 'ADD_FAILED'
            let successMsgType = _matrix_id ? 'UPDATE_SUCCESS' : 'ADD_SUCCESS'

            if (!_matrix_id) {

                _query = {
                    text: "INSERT INTO tbl_wallet_debit_matrix(matrix_code,description,reward_balance,deposit_balance,winning_balance,fallback,status,created_by,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,now()) RETURNING *",
                    values: [
                        _matrix_code, _description, _reward_balance, _deposit_balance, _winning_balance, _fallback, _status, _created_by
                    ]
                }
            }
            else {

                _query = {
                    text: "UPDATE tbl_wallet_debit_matrix SET matrix_code=$1,description=$2,reward_balance=$3,deposit_balance=$4,winning_balance=$5,fallback=$6,status=$7,updated_by=$8,updated_at=now() WHERE matrix_id=$9 RETURNING *",
                    values: [
                        _matrix_code, _description, _reward_balance, _deposit_balance, _winning_balance, _fallback, _status, _updated_by, _matrix_id
                    ]
                }

            }

            try {

                let result = await pgConnection.executeQuery('rmg_dev_db', _query)


                if (result.length > 0) {
                    services.sendResponse.sendWithCode(req, res, result[0], customMsgType, successMsgType);
                } else {
                    services.sendResponse.sendWithCode(req, res, error, customMsgType, errMsgType);
                }
            }
            catch (error) {

                services.sendResponse.sendWithCode(req, res, error, customMsgType, errMsgType);
            }
        }

        else {
            services.sendResponse.sendWithCode(req, res, validation.errors.errors, customMsgTypeCM, "VALIDATION_FAILED");

        }
    },

    uploadImages: async function (req, res) {

        let s3Folder = req.body.s3Folder ? req.body.s3Folder : 'uploadImages';

        if (req.files != null && req.files.length > 0) {

            let s3Data = await services.s3.upload(req, s3Folder, true);

            // _query = `INSERT INTO public.tbl_s3_images("name", etag, "location", "key", bucket) VALUES('${s3Data.key.replace('uploadImages/', '')}', '${s3Data.ETag}', '${s3Data.Location}', '${s3Data.key}', '${s3Data.Bucket}') returning img_id;`;

            try {
                // let dbResult = await pgConnection.executeQuery('rmg_dev_db', _query)

                if (s3Data) {
                    services.sendResponse.sendWithCode(req, res, s3Data, customMsgType, "GET_SUCCESS");
                } else {
                    services.sendResponse.sendWithCode(req, res, dbResult, customMsgType, "GET_FAILED");
                }
            }
            catch (error) {
                services.sendResponse.sendWithCode(req, res, error, customMsgTypeCM, "DB_ERROR");
            }

        } else { services.sendResponse.sendWithCode(req, res, 'no file', customMsgType, "GET_FAILED"); }
    },

    showImages: async function (req, res) {

        let bucketname = 'static.bigpesa.in';
        let s3Folder = req.body.s3Folder ? req.body.s3Folder : 'uploadImages';
        let s3DataList = await services.s3.listObjects(bucketname, s3Folder);

        // console.log(s3DataList.Contents[0]);
        let s3keys = []
        for (const i of s3DataList.Contents) {
            // console.log(i);
            for (const key in i) {
                if (i.hasOwnProperty(key)) {
                    if (key == 'Key') {
                        console.log(i['Key']);
                        s3keys.push(i['Key'])
                    }
                }
            }
        }

        newarr = s3keys.map(x => {
            return {location:`http://${bucketname}/${x}`,key:x}
        })


        try {
            // let dbResult = await pgConnection.executeQuery('rmg_dev_db', _query)

            if (s3keys && s3keys.length > 0) {
                services.sendResponse.sendWithCode(req, res, newarr, customMsgType, "GET_SUCCESS");
            } else {
                services.sendResponse.sendWithCode(req, res, newarr, customMsgType, "GET_FAILED");
            }
        }
        catch (error) {
            services.sendResponse.sendWithCode(req, res, error, customMsgTypeCM, "DB_ERROR");
        }
    },

    removeImage: async function (req, res) {
        let bucket = 'static.bigpesa.in';
        let key = req.body.key;

        try {
            if (bucket && key) {
                let s3Data = await services.s3.removeFromS3(bucket, key);
                if (s3Data == 200 || s3Data == 404) {
                    // console.log('delete from db', s3Data);

                    // let _query = `delete from tbl_s3_images where key = '${key}'`

                    // let dbResult = await pgConnection.executeQuery('rmg_dev_db', _query)
                    // console.log(dbResult);

                    services.sendResponse.sendWithCode(req, res, 'delete from s3', customMsgType, "GET_SUCCESS");

                } else {
                    console.log('error at s3', s3Data);
                    services.sendResponse.sendWithCode(req, res, 'error at s3', customMsgType, "GET_SUCCESS");
                }

            } else {
                services.sendResponse.sendWithCode(req, res, 'bucket && key missing', customMsgType, "GET_FAILED");
            }
        } catch (error) {
            services.sendResponse.sendWithCode(req, res, error, customMsgTypeCM, "DB_ERROR");
        }
    }

}

async function chkTransTbl(date) {

    return new Promise(async (resolve, reject) => {

        let _query = `update tbl_wallet_credit_que
        set is_credit = true , status = 'SUCCESS' , transaction_id = tbl_wallet_transaction.order_id
        from tbl_wallet_transaction
        where tbl_wallet_credit_que.event_id = tbl_wallet_transaction.nz_txn_event_id
        and tbl_wallet_credit_que.player_id = tbl_wallet_transaction.player_id
        and tbl_wallet_transaction.nz_txn_status = 'SUCCESS'
        and tbl_wallet_transaction.nz_txn_type = 'CREDIT'
        and tbl_wallet_credit_que.status = 'PROCESSING'
        and tbl_wallet_credit_que.add_date::date = '${date}'
        returning que_id`;

        try {

            let result = await pgConnection.executeQuery('rmg_dev_db', _query)

            if (result.length > 0) {
                resolve(true);
            } else {
                resolve(false);
            }
        }
        catch (error) {
            console.log(error);
            reject(error);
        }
    });
}