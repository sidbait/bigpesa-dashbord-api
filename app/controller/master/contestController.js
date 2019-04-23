const pgConnection = require('../../model/pgConnection');

const mv = require('mv');
const excelToJson = require('convert-excel-to-json');
const moment = require('moment')
const request = require("request");
const dateFormat = require('dateformat');

const services = require('../../service/service');

const customMsgType = "MASTER_MESSAGE";
const customMsgTypeCM = "COMMON_MESSAGE";

module.exports = {

    rebuildCache: async function (req, res) {

        let options = {
            method: 'GET',
            url: 'http://localhost:3002/rebuildcashe',
            qs: { key: 'XVyDHGaMr7diiHMV7PP9oxugZdIty1ud' },
            headers:
            {
                'cache-control': 'no-cache'
            }
        };

        try {
            request(options, function (error, response, body) {
                // if (error) throw new Error(error);

                console.log(body);
                if (body) {
                    services.sendResponse.sendWithCode(req, res, body, 'Rebuild_Cache', "on_success");
                }
                else
                    services.sendResponse.sendWithCode(req, res, error, 'Rebuild_Cache', "on_failed");
            });
        }
        catch (error) {
            services.sendResponse.sendWithCode(req, res, error, 'Rebuild_Cache', "on_failed");
        }
    },

    runContestCron: async function (req, res) {

        console.log('createDailyContest Start ' + new Date());
        var todaysDate = new Date()
        var dt = dateFormat(todaysDate, "yyyy-mm-dd");
        let insertquery = `insert into tbl_contest (contest_master_id, app_id, contest_name, contest_type,contest_desc, start_date, end_date, from_time, to_time, max_players, winners, entry_fee, currency, profit_margin, status, debit_type, credit_type, win_amount, css_class, contest_priority, game_conf,created_at,publish_type,channel) 
        select contest_master_id, app_id, contest_name, contest_type, contest_desc,  (('${dt}' || ' ' || from_time ::text)::timestamptz) ,  (('${dt}' || ' ' || to_time ::text)::timestamptz ),   from_time, to_time, max_players, winners, entry_fee, currency, profit_margin, status, debit_type, credit_type, win_amount, css_class, contest_priority, game_conf,now(),publish_type,channel from tbl_contest_master 
        where contest_master_id not in (select contest_master_id from tbl_contest where start_date::DATE = '${dt}' and contest_master_id is not null) 
        and contest_type ='Daily' and status = 'ACTIVE' returning contest_master_id`;

        console.log('addContestForDate - ', insertquery);

        try {
            let dbResult = await pgConnection.executeQuery('rmg_dev_db', insertquery);

            console.log('addContestForDate dbResult - ', JSON.stringify(dbResult));

            if (dbResult && dbResult.length > 0) {
                insertContestRankDetails()
                services.sendResponse.sendWithCode(req, res, dbResult.length, 'runContestCron', "on_success");
            }
            else
                services.sendResponse.sendWithCode(req, res, dbResult, 'runContestCron', "on_failed");
        }
        catch (error) {
            services.sendResponse.sendWithCode(req, res, error, customMsgTypeCM, "DB_ERROR");
        }
    },

    runRankCron: async function (req, res) {
        insertContestRankDetails()
            .then((r) => {
                services.sendResponse.sendWithCode(req, res, r, 'insertRankM', "on_success");
            })
            .catch((e) => {
                services.sendResponse.sendWithCode(req, res, e, 'insertRankM', "on_failed");
            })
    },

    getAll: async function (req, res) {

        let _selectQuery = "SELECT * FROM tbl_contest_master ORDER BY 1 DESC LIMIT 10"
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

    getPending: async function (req, res) {
        // console.log(req.body);

        let app_id = req.body.app_id ? req.body.app_id : null;

        let _selectQuery = `select tbl_app.app_name,tbl_contest_master.* from tbl_contest_master 
        inner join tbl_app on tbl_contest_master.app_id = tbl_app.app_id
        where 1=1
        and tbl_contest_master."status" = 'PENDING' and tbl_contest_master.app_id = ${app_id} order by from_time`
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

    getRank: async function (req, res) {
        // console.log(req.body);

        let contest_master_id = req.body.contest_master_id ? req.body.contest_master_id : null;

        let _selectQuery = `select * from tbl_contest_rank_master where contest_master_id = ${contest_master_id} order by lower_rank`
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

    getEntryFee: async function (req, res) {

        let _selectQuery = `select distinct entry_fee from tbl_contest order by entry_fee`
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

    enablePendingContest: async function (req, res) {

        let pendingIds = req.body.pendingIds ? req.body.pendingIds : null;

        let _selectQuery = `update tbl_contest_master set "status"='ACTIVE' where contest_master_id in (${pendingIds}) returning contest_master_id`
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

    getContestById: async function (req, res) {

        let contest_master_id = req.body.contest_master_id ? req.body.contest_master_id : null;

        let _selectQuery = `select * from tbl_contest_master where contest_master_id = ${contest_master_id}`;

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

    getAllContest: async function (req, res) {

        // let app_id = req.body.app_id ? req.body.app_id : null;

        let _selectQuery = `select distinct entry_fee,debit_type from tbl_contest_master
        where status = 'ACTIVE'
        group by entry_fee,debit_type
        order by debit_type ,entry_fee desc`;

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

    setAllContestOrder: async function (req, res) {
        // res.send({ "ok": "inresults" })

        // console.log(req.body);

        let allMasterContestOrder = req.body.allMasterContestOrder ? req.body.allMasterContestOrder : null;

        let updateQueries = await getUpdateQueriesContestOrder(allMasterContestOrder);

        console.log(updateQueries);

        Promise.all(updateQueries.map(async (query) => {
            return await pgConnection.executeQuery('rmg_dev_db', query);
        })).then((inresults) => {
            // console.log(inresults);
            res.send({ "ok": inresults })
        })

    },

    add: async function (req, res) {

        let rules = {
            "app_id": 'required|numeric',
            "contest_name": 'required',
            "contest_type": 'required',
            "start_date": 'required',
            "end_date": 'required',
            "from_time": 'required',
            "to_time": 'required',
            "max_players": 'required',
            "winners": 'required',
            "entry_fee": 'required',
            "currency": 'required',
            // "profit_margin": 'required',
            "debit_type": 'required',
            "credit_type": 'required',
            "win_amount": 'required',
            "status": 'required',
        };

        let obj = req.body
        console.log(obj);

        // deleting null value from req.body
        Object.keys(obj).forEach(k => (obj[k] === 'null') && delete obj[k]);

        let validation = new services.validator(req.body, rules);

        if (validation.passes()) {

            let _contest_master_id = req.body.contest_master_id ? req.body.contest_master_id : null;
            let _contest_clone_id = req.body.contest_clone_id ? req.body.contest_clone_id : null;
            let _app_id = req.body.app_id ? req.body.app_id : null;
            let _contest_name = req.body.contest_name ? req.body.contest_name : null;
            let _contest_type = req.body.contest_type ? req.body.contest_type : null;
            let _contest_desc = req.body.contest_desc ? req.body.contest_desc : null;
            let _is_repeat = req.body.is_repeat ? req.body.is_repeat : null;
            let _start_date = req.body.start_date ? req.body.start_date : null;
            let _end_date = req.body.end_date ? req.body.end_date : null;
            let _from_time = req.body.from_time ? req.body.from_time : null;
            let _to_time = req.body.to_time ? req.body.to_time : null;
            let _max_players = req.body.max_players ? req.body.max_players : null;
            let _winners = req.body.winners ? req.body.winners : null;
            let _entry_fee = req.body.entry_fee ? req.body.entry_fee : null;
            let _currency = req.body.currency ? req.body.currency : null;
            let _profit_margin = req.body.profit_margin ? req.body.profit_margin : null;
            let _debit_type = req.body.debit_type ? req.body.debit_type : null;
            let _credit_type = req.body.credit_type ? req.body.credit_type : null;
            let _win_amount = req.body.win_amount ? req.body.win_amount : null;
            let _css_class = req.body.css_class ? req.body.css_class : null;
            let _next_start_date = (req.body.next_start_date && req.body.next_start_date != 'NaN-NaN-NaN') ? req.body.next_start_date : null;
            let _publish_type = req.body.publish_type ? req.body.publish_type : null;
            let _status = req.body.status ? req.body.status : null;
            let _created_by = req.body.userid ? req.body.userid : null;
            let _updated_by = req.body.userid ? req.body.userid : null;
            let _contest_priority = req.body.contest_priority ? req.body.contest_priority : null;
            let _game_conf = req.body.game_conf ? req.body.game_conf : '';
            let _channel = req.body.channel ? req.body.channel : null;
            // let _show_upcoming = req.body.show_upcoming ? req.body.show_upcoming : null;
            let _max_lives = req.body.max_lives ? req.body.max_lives : null;
            let _min_player = req.body.min_player ? req.body.min_player : null;
            let _rank_desc = req.body.rank_desc ? req.body.rank_desc : null;
            let _contest_minutes = req.body.contest_minutes ? req.body.contest_minutes : null;
            let _contest_icon_url = req.body.contest_icon_url ? req.body.contest_icon_url : null

            let _query;

            let errMsgType = _contest_master_id ? 'UPDATE_FAILED' : 'ADD_FAILED'
            let successMsgType = _contest_master_id ? 'UPDATE_SUCCESS' : 'ADD_SUCCESS'

            let _contest_icon;
            if (req.files.length > 0) {
                _contest_icon = req.files[0].path.replace('public', '')
                console.log(_contest_icon);
            }

            if (!_contest_master_id) {

                _query = {
                    text: "INSERT INTO tbl_contest_master(app_id,contest_name,contest_type,contest_desc,start_date,end_date,from_time,to_time,max_players,winners,entry_fee,currency,profit_margin,debit_type,credit_type,win_amount,css_class,next_start_date,contest_priority,game_conf,publish_type,status,created_by,created_at,channel,is_repeat,max_lives,min_player,rank_desc,contest_minutes,contest_icon) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,now(),$24,$25,$26,$27,$28,$29,$30) RETURNING *",
                    values: [
                        _app_id, _contest_name, _contest_type, _contest_desc, _start_date, _end_date, _from_time, _to_time, _max_players, _winners, _entry_fee, _currency, _profit_margin, _debit_type, _credit_type, _win_amount, _css_class, _next_start_date, _contest_priority, _game_conf, _publish_type, _status, _created_by, _channel, _is_repeat, _max_lives, _min_player, _rank_desc, _contest_minutes, _contest_icon_url
                    ]
                }
            }
            else {

                _query = {
                    text: "UPDATE tbl_contest_master SET app_id=$1,contest_name=$2,contest_type=$3,contest_desc=$4,start_date=$5,end_date=$6,from_time=$7,to_time=$8,max_players=$9,winners=$10,entry_fee=$11,currency=$12,profit_margin=$13,debit_type=$14,credit_type=$15,win_amount=$16,css_class=$17,next_start_date=$18,contest_priority=$19,game_conf=$20,status=$21,updated_by=$22,updated_at=now(),publish_type=$24,channel=$25,is_repeat= $26, max_lives=$27,min_player=$28,rank_desc=$29,contest_minutes=$30, contest_icon=$31 WHERE contest_master_id=$23 RETURNING *",
                    values: [
                        _app_id, _contest_name, _contest_type, _contest_desc, _start_date, _end_date, _from_time, _to_time, _max_players, _winners, _entry_fee, _currency, _profit_margin, _debit_type, _credit_type, _win_amount, _css_class, _next_start_date, _contest_priority, _game_conf, _status, _updated_by, _contest_master_id, _publish_type, _channel, _is_repeat, _max_lives, _min_player, _rank_desc, _contest_minutes, _contest_icon_url
                    ]
                }

            }

            try {

                let result = await pgConnection.executeQuery('rmg_dev_db', _query)

                // console.log(result);

                if (result.length > 0) {

                    if (_contest_clone_id) {
                        cloneRanks(_contest_clone_id, result[0].contest_master_id);
                    }

                    if (req.files != null && req.files.length > 0) {
                        let movePath = await uploadBanner(req, result[0].contest_master_id);

                        let mvQuery = {
                            text: "UPDATE tbl_contest_master set contest_icon = $1 WHERE contest_master_id= $2 RETURNING *",
                            values: [
                                movePath.replace('./public', ''),
                                result[0].contest_master_id
                            ]
                        }

                        let mvResult = await pgConnection.executeQuery('rmg_dev_db', mvQuery)

                        console.log(mvResult);
                    }

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

    addBulk: async function (req, res) {

        let rules = {
            "app_id": 'required|numeric'
        };

        let validation = new services.validator(req.body, rules);

        if (validation.passes()) {

            let _app_id = req.body.app_id ? req.body.app_id : null;
            let uploadFilepath = `./public/bulk/contest/${_app_id}/`;

            if (req.files != null && req.files.length > 0) {
                let from_path = req.files[0].destination + req.files[0].filename;
                let splt = req.files[0].originalname.split('.');
                let ext = splt[splt.length - 1];

                if (ext.toLowerCase() == "xlsx") {
                    let dest_path = Date.now() + '_' + req.files[0].originalname;
                    let moveto = uploadFilepath + dest_path;
                    moveto = moveto.toLowerCase();

                    try {
                        const xlsxFilePath = await moveFile(from_path, moveto)
                        // console.log(xlsxFilePath);

                        const sheetData = await readSheet(xlsxFilePath)
                        // console.log(sheetData);

                        // console.log(sheetData.rankData[0].contest_uid);

                        const queriesWithId = await getQueriesContestData(sheetData, _app_id)
                        // console.log(queriesWithId);

                        // for (const querieWithId of queriesWithId) {
                        Promise.all(queriesWithId.map(async (querieWithId) => {
                            let query = querieWithId.query
                            let contest_uid = querieWithId.contest_uid

                            // console.log(query, contest_uid);

                            let contest_master_id = await pgConnection.executeQuery('rmg_dev_db', query)
                            // let contest_master_id = '123'
                            const queries = await getQueriesRankData(sheetData, contest_uid, contest_master_id[0].contest_master_id)


                            Promise.all(queries.map(async (query) => {
                                if (query != false) {
                                    return await pgConnection.executeQuery('rmg_dev_db', query);
                                }
                            })).then((inresults) => {
                                // console.log(inresults);

                            })

                            return contest_master_id;

                        })).then((results) => {
                            console.log(results);
                            services.sendResponse.sendWithCode(req, res, results, customMsgType, "ADD_SUCCESS");

                        })




                    } catch (error) {
                        console.log(error);
                        services.sendResponse.sendWithCode(req, res, error, customMsgType, "ADD_FAILED");
                    }

                } else {
                    console.log('Validation failed! Please provide proper xlsx file.');
                    services.sendResponse.sendWithCode(req, res, 'Validation failed! Please provide proper xlsx file.', customMsgType, "ADD_FAILED");

                }
            } else {
                services.sendResponse.sendWithCode(req, res, validation.errors.errors, customMsgTypeCM, "VALIDATION_FAILED");

            }
        }

        else {
            services.sendResponse.sendWithCode(req, res, validation.errors.errors, customMsgTypeCM, "VALIDATION_FAILED");

        }
    },

    search: async function (req, res) {

        let _contest_master_id = req.body.contest_master_id ? req.body.contest_master_id : null;
        let _contest_clone_id = req.body.contest_clone_id ? req.body.contest_clone_id : null;
        let _app_id = req.body.app_id ? req.body.app_id : null;
        let _contestname = req.body.contestname ? req.body.contestname : null;
        let _fromDate = req.body.frmdate ? req.body.frmdate : null;
        let _toDate = req.body.todate ? req.body.todate : null;
        let _status = req.body.status ? req.body.status : null;

        let _publish_type = req.body.publish_type ? req.body.publish_type : null;
        let _debit_type = req.body.debit_type ? req.body.debit_type : null;
        let _credit_type = req.body.credit_type ? req.body.credit_type : null;
        let _win_amount = req.body.win_amount ? req.body.win_amount : null;
        let _entry_fee = req.body.entry_fee ? req.body.entry_fee : null;

        let _repeat_mode = req.body.repeat_mode ? req.body.repeat_mode : null;

        let _selectQuery = `select tbl_app.app_name,tbl_contest_master.* from tbl_contest_master inner join tbl_app on tbl_contest_master.app_id = tbl_app.app_id WHERE  1=1`

        if (_contest_master_id) {
            _selectQuery += " AND contest_master_id = '" + _contest_master_id + "'"
        }

        if (_contest_clone_id) {
            _selectQuery += " AND contest_master_id = '" + _contest_clone_id + "'"
        }

        if (_app_id) {
            _selectQuery += " AND tbl_contest_master.app_id = '" + _app_id + "'"
        }

        if (_contestname) {
            _selectQuery += " AND contest_name ilike '%" + _contestname + "%'"
        }

        if (_win_amount) {
            _selectQuery += " AND win_amount = '" + _win_amount + "'"
        }

        if (_entry_fee) {
            _selectQuery += " AND entry_fee = '" + _entry_fee + "'"
        }

        if (_publish_type && _publish_type != '') {

            _selectQuery += " AND CONCAT(',', publish_type, ',') like '%," + _publish_type + ",%'"
        }

        if (_debit_type) {
            _selectQuery += " AND debit_type = '" + _debit_type + "'"
        }

        if (_credit_type) {
            _selectQuery += " AND credit_type = '" + _credit_type + "'"
        }

        if (_status) {
            _selectQuery += " AND tbl_contest_master.status = '" + _status + "'"
        }

        if (_repeat_mode) {
            _selectQuery += " AND contest_type != 'Daily'"
        }

        if (_fromDate && _toDate) {
            _fromDate = _fromDate.split(' ');
            _toDate = _toDate.split(' ');

            _selectQuery += ` AND start_date::date >= '${_fromDate[0]}' AND end_date::date <= '${_toDate[0]}' AND from_time >= '${_fromDate[1]}' AND to_time <= '${_toDate[1]}'`
        }

        // _selectQuery += ' LIMIT 5'


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

    updateContestStatus: async function (req, res) {

        let rules = {
            "selectedContests": 'required',
            "status": 'required',
        }

        let validation = new services.validator(req.body, rules);

        if (validation.passes()) {

            let _selectedContests = req.body.selectedContests ? req.body.selectedContests : null;
            let _userid = req.body.userid ? req.body.userid : null;
            let _status = req.body.status ? req.body.status : null;

            try {

                let _updateQuery = `update tbl_contest_master set status = '${_status}', updated_by = '${_userid}', updated_at = now() where contest_master_id in (${_selectedContests.toString()}) returning contest_master_id`

                let _updated_id = await pgConnection.executeQuery('rmg_dev_db', _updateQuery)

                services.sendResponse.sendWithCode(req, res, _updated_id, "CONTEST_MESSAGE", "CONTEST_UPDATED");
            }
            catch (error) {
                console.log(error);

                services.sendResponse.sendWithCode(req, res, 'error', customMsgTypeCM, "DB_ERROR");
            }
        } else {
            services.sendResponse.sendWithCode(req, res, validation.errors.errors, customMsgTypeCM, "VALIDATION_FAILED");
        }
    },

}

async function uploadBanner(req, contest_master_id) {

    return new Promise((resolve, reject) => {

        let uploadFilepath = `./public/master/contest/${req.body.app_id}/${contest_master_id}/`;

        let object = req.files;
        for (const key in object) {
            if (object.hasOwnProperty(key)) {

                const element = object[key];

                let fromPath = element.destination + element.filename;

                let extension = path.extname(fromPath)

                if (extension.toLowerCase() == ".jpg" ||
                    extension.toLowerCase() == ".jpeg" ||
                    extension.toLowerCase() == ".png" ||
                    extension.toLowerCase() == ".gif") {

                    let movePath = uploadFilepath + element.filename;
                    movePath = movePath.toLowerCase();

                    console.log("fromPath - " + fromPath + "\n" +
                        "extension - " + extension + "\n" +
                        "movePath - " + movePath + "\n"
                    );

                    mv(fromPath, movePath, { mkdirp: true }, function (err) {

                        if (err) {
                            reject(err);
                        }
                        else
                            resolve(movePath)
                    });
                }
                else
                    reject("error - Invalid File Format")
            }
            else
                reject("error - hasOwnProperty error")
        }
    });
}

function readSheet(xlsxFilePath) {
    return new Promise((resolve, reject) => {
        const result = excelToJson({
            sourceFile: xlsxFilePath,
            sheets: [{
                name: 'contestData',
                columnToKey: {
                    A: 'contest_uid',
                    B: 'contest_name',
                    C: 'contest_type',
                    D: 'contest_desc',
                    E: 'is_repeat',
                    F: 'start_date',
                    G: 'end_date',
                    H: 'from_time',
                    I: 'to_time',
                    J: 'max_players',
                    K: 'winners',
                    L: 'entry_fee',
                    M: 'currency',
                    N: 'profit_margin',
                    O: 'next_start_date',
                    P: 'status',
                    Q: 'debit_type',
                    R: 'credit_type',
                    S: 'win_amount',
                    T: 'css_class',
                    U: 'contest_priority',
                    V: 'game_conf',
                    W: 'contest_icon',
                    X: 'publish_type',
                    Y: 'channel'
                }
            }, {
                name: 'rankData',
                columnToKey: {
                    A: 'contest_uid',
                    B: 'rank_name',
                    C: 'rank_desc',
                    D: 'lower_rank',
                    E: 'upper_rank',
                    F: 'prize_amount',
                    G: 'status',
                    H: 'credit_type'
                }
            }],
            header: {
                rows: 1 // 2, 3, 4, etc.
            }
        });
        resolve(result)
    });
}

function getQueriesContestData(sheetData, _app_id) {

    return new Promise((resolve, reject) => {
        if (sheetData && sheetData.contestData) {
            let queries = sheetData.contestData.map(object => {

                object['app_id'] = _app_id
                object['from_time'] = getFormattedTime(object['from_time'])
                object['to_time'] = getFormattedTime(object['to_time'])
                let count = 0;
                let cols = [];
                let values = [];
                let dollcount = []

                for (const key in object) {
                    if (object.hasOwnProperty(key) && key != 'contest_uid') {

                        const element = object[key];

                        cols.push(key)

                        values.push(element)
                        count = count + 1;

                        dollcount.push(`$${count}`)

                    }
                }

                query = {
                    text: `INSERT INTO tbl_contest_master(${cols.toString()}) VALUES (${dollcount}) RETURNING contest_master_id`,
                    values: values
                }
                // console.log(query,object['contest_uid']);
                let contest_uid = object['contest_uid'];
                let output = {
                    query,
                    contest_uid
                }
                return output;
            })

            resolve(queries)
        } else {
            reject('wrong sheetData or sheet name')
        }
    });
}

function moveFile(from_path, moveto) {
    return new Promise((resolve, reject) => {
        mv(from_path, moveto, { mkdirp: true }, function (err) {
            if (err) {
                reject(err);
            }
            else {
                resolve(moveto)
            }
        });
    });
}

function getFormattedTime(date) {

    let momentDate = moment(date)

    let hr = momentDate.hours();
    let min = momentDate.minutes();
    let sec = momentDate.seconds();

    return hr + ':' + min + ':' + sec;
}

function getQueriesRankData(sheetData, contest_uid, contest_master_id) {

    return new Promise((resolve, reject) => {

        let queries = sheetData.rankData.map(object => {
            if (contest_uid == object['contest_uid']) {
                object['contest_master_id'] = contest_master_id

                let count = 0;
                let cols = [];
                let values = [];
                let dollcount = []

                for (const key in object) {
                    if (object.hasOwnProperty(key) && key != 'contest_uid') {

                        const element = object[key];

                        cols.push(key)

                        values.push(element)
                        count = count + 1;

                        dollcount.push(`$${count}`)

                    }
                }

                query = {
                    text: `INSERT INTO tbl_contest_rank_master(${cols.toString()}) VALUES (${dollcount}) RETURNING contest_rank_master_id`,
                    values: values
                }

                return query;
            } else {
                return false;
            }

        })

        resolve(queries)
    });
}

async function insertContestRankDetails() {
    return new Promise(async (resolve, reject) => {
        // let pendingContestRank = 'select distinct contest_id, contest_master_id from ' +
        //     ' tbl_contest where created_at::Date = now()::date and ' +
        //     ' contest_id not in (select distinct contest_id from tbl_contest_rank) order by contest_id'

        let pendingContestRank = `select distinct contest_id, contest_master_id from tbl_contest  where created_at > (now() - (7 * interval '1 Day')) and status = 'ACTIVE' and contest_master_id is not null and  contest_id not in (select distinct contest_id from tbl_contest_rank) order by contest_id`

        try {
            let dbResult = await pgConnection.executeQuery('rmg_dev_db', pendingContestRank);

            if (dbResult && dbResult.length > 0) {

                resolve(dbResult.length)

                dbResult.forEach(async element => {

                    console.log(element)

                    let insertRankdetails = "insert into tbl_contest_rank ( contest_id, rank_name, rank_desc, lower_rank, upper_rank, prize_amount, status, created_at, updated_at, credit_type) " +
                        " select  " + element.contest_id + ", rank_name, rank_desc,  lower_rank, upper_rank, prize_amount, status, created_at, updated_at,credit_type from tbl_contest_rank_master where contest_master_id =  " + element.contest_master_id + " returning contest_id";

                    // console.log('insertRankdetails - ', insertRankdetails);
                    if (element.contest_id && element.contest_master_id) {
                        try {

                            let dbResult = await pgConnection.executeQuery('rmg_dev_db', insertRankdetails);
                            // resolve(dbResult)
                            console.log(dbResult);

                        } catch (error) {
                            // reject(error)
                            console.log(error);
                        }
                    } else {
                        // reject('Error In distinct')
                        console.log('no contest_master_id');
                    }
                });
            }
            else {
                reject('Error In distinct')
                console.log('Error In distinct');
            }
        }
        catch (error) {
            reject(error)
            console.log('Error In distinct', error);
        }
    });
}


async function cloneRanks(contest_clone_id, contest_master_id) {

    console.log('contest_clone_id', contest_clone_id);
    console.log('contest_master_id', contest_master_id);

    let insertBulkRank = `INSERT INTO tbl_contest_rank_master(contest_master_id,rank_name,rank_desc,lower_rank,upper_rank,prize_amount,credit_type,status,created_by)
    select ${contest_master_id},rank_name,rank_desc,lower_rank,upper_rank,prize_amount,credit_type,status,created_by from tbl_contest_rank_master
    where contest_master_id = ${contest_clone_id} RETURNING rank_name`

    try {

        let result = await pgConnection.executeQuery('rmg_dev_db', insertBulkRank)

        console.log(result);

        if (result.length > 0) {
            console.log('done');

        } else {
            console.log('result.length', result.length);
        }
    }
    catch (error) {
        console.log(error);
    }
}

async function getUpdateQueriesContestOrder(allMasterContestOrder) {

    return new Promise((resolve, reject) => {
        let updateQuerie = []

        for (let i = 0; i < allMasterContestOrder.length; i++) {
            const x = allMasterContestOrder[i].split("-");
            const priority = i;

            let _query = `update tbl_contest_master set contest_priority = ${priority} where entry_fee =${x[0]} and debit_type='${x[1]}'`;

            updateQuerie.push(_query)
        }

        resolve(updateQuerie)
    });
}