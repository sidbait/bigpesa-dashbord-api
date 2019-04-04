const pgConnection = require('../../model/pgConnection');
const mv = require('mv');
const excelToJson = require('convert-excel-to-json');
const moment = require('moment')
const services = require('../../service/service');

const customMsgType = "MASTER_MESSAGE";
const customMsgTypeCM = "COMMON_MESSAGE";

module.exports = {

    getAll: async function (req, res) {

        let _selectQuery = "SELECT * FROM tbl_contest ORDER BY 1 DESC LIMIT 10"
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

        let contest_id = req.body.contest_id ? req.body.contest_id : null;

        let _selectQuery = `select * from tbl_contest_rank where contest_id = ${contest_id} order by lower_rank`
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

        let contest_id = req.body.contest_id ? req.body.contest_id : null;

        let _selectQuery = `select * from tbl_contest where contest_id = ${contest_id}`;

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

    getLiveContest: async function (req, res) {

        let app_id = req.body.app_id ? req.body.app_id : null;

        // let _selectQuery = `select contest_name,contest_id,entry_fee,debit_type from tbl_contest where app_id = ${app_id} AND now()::timestamptz + (330::int * '1m'::interval) between start_date and end_date order by contest_priority`;

        let _selectQuery = `select
        case
            when count(tbl_contest_leader_board.player_id) = max_players then 'full'
            else concat (count(tbl_contest_leader_board.player_id),
            '/',
            max_players)
        end as joined,
        contest_name,
        tbl_contest.contest_id,
        entry_fee,
        debit_type
    from
        tbl_contest
    left join tbl_contest_leader_board on
        tbl_contest.contest_id = tbl_contest_leader_board.contest_id
    where
        tbl_contest.app_id = ${app_id}
        and tbl_contest.status = 'ACTIVE'
        and now()::timestamptz + (330::int * '1m'::interval) between start_date and end_date
    group by
        contest_name,
        tbl_contest.contest_id
    order by
        contest_priority,
        contest_id`;

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

    setLiveContestOrder: async function (req, res) {
        // res.send({ "ok": "inresults" })

        // console.log(req.body);

        let liveContestOrder = req.body.liveContestOrder ? req.body.liveContestOrder : null;

        let updateQueries = await getUpdateQuerie(liveContestOrder);

        // console.log(updateQueries);

        Promise.all(updateQueries.map(async (query) => {
            return await pgConnection.executeQuery('rmg_dev_db', query);
        })).then((inresults) => {
            // console.log(inresults);
            res.send({ "ok": inresults })
        })

    },

    getAllContest: async function (req, res) {

        // let app_id = req.body.app_id ? req.body.app_id : null;

        let _selectQuery = `select distinct entry_fee,debit_type from tbl_contest
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

        let allContestOrder = req.body.allContestOrder ? req.body.allContestOrder : null;

        let updateQueries = await getUpdateQueriesContestOrder(allContestOrder);

        console.log(updateQueries);

        Promise.all(updateQueries.map(async (query) => {
            return await pgConnection.executeQuery('rmg_dev_db', query);
        })).then((inresults) => {
            // console.log(inresults);
            res.send({ "ok": inresults })
        })

    },

    getConfByAppId: async function (req, res) {

        let app_id = req.body.app_id ? req.body.app_id : null;

        let _selectQuery = `select * from tbl_game_conf where status = 'ACTIVE' and app_id = ${app_id}`;

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

    getContestLeaderboard: async function (req, res) {

        let contest_id = req.body.contest_id ? req.body.contest_id : null;

        let _selectQuery = `select
        contest_id,
        tbl_contest_leader_board.app_id,
        tbl_contest_leader_board.player_id,
        case
            when (full_name is null)
            or (full_name = '') then phone_number
            else full_name
        end as full_name,
        phone_number,
        total_score,
        rank() over (partition by contest_id
    order by
        tbl_contest_leader_board.total_score desc,
        tbl_contest_leader_board.created_at asc) as player_rank
    from
        rmg_db.public.tbl_contest_leader_board
    inner join rmg_db.public.tbl_player on
        tbl_player.player_id = tbl_contest_leader_board.player_id
    where
        contest_id = ${contest_id}
    group by
        contest_id,
        tbl_contest_leader_board.app_id,
        tbl_contest_leader_board.player_id,
        full_name,
        email_id,
        phone_number,
        contest_date,
        total_score,
        tbl_contest_leader_board.created_at
    order by
        player_rank asc;`;

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

            let _selectQuery = `select contest_id,status from tbl_contest
            where contest_id in (${_selectedContests.toString()})
            AND now()::timestamptz + (330::int * '1m'::interval) < start_date`
            try {

                let isUpComing = await pgConnection.executeQuery('rmg_dev_db', _selectQuery)

                if (isUpComing && isUpComing.length > 0) {

                    let _updateQuery = `update tbl_contest set status = '${_status}', updated_by = '${_userid}', updated_at = now() where contest_id in (${_selectedContests.toString()}) returning contest_id`

                    let _updated_id = await pgConnection.executeQuery('rmg_dev_db', _updateQuery)

                    services.sendResponse.sendWithCode(req, res, _updated_id, "CONTEST_MESSAGE", "CONTEST_UPDATED");
                }
                else
                    services.sendResponse.sendWithCode(req, res, null, "CONTEST_MESSAGE", "IS_UPCOMING_FALSE");
            }
            catch (error) {
                console.log(error);

                services.sendResponse.sendWithCode(req, res, 'error', customMsgTypeCM, "DB_ERROR");
            }
        } else {
            services.sendResponse.sendWithCode(req, res, validation.errors.errors, customMsgTypeCM, "VALIDATION_FAILED");
        }
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
        // deleting null value from req.body
        Object.keys(obj).forEach(k => (obj[k] === 'null') && delete obj[k]);

        let validation = new services.validator(req.body, rules);

        if (validation.passes()) {

            let _contest_id = req.body.contest_id ? req.body.contest_id : null;
            let _contest_clone_id = req.body.contest_clone_id ? req.body.contest_clone_id : null;
            let _app_id = req.body.app_id ? req.body.app_id : null;
            let _contest_name = req.body.contest_name ? req.body.contest_name : null;
            let _contest_type = req.body.contest_type ? req.body.contest_type : null;
            let _contest_desc = req.body.contest_desc ? req.body.contest_desc : null;
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
            let _show_upcoming = req.body.show_upcoming ? req.body.show_upcoming : null;

            let _show_from_date = req.body.show_from_date ? req.body.show_from_date : null;
            let _show_from_time = req.body.show_from_time ? req.body.show_from_time : null;
            let _max_lives = req.body.max_lives ? req.body.max_lives : null;
            let _min_player = req.body.min_player ? req.body.min_player : null;
            let _rank_desc = req.body.rank_desc ? req.body.rank_desc : null;

            let _query;
            let errMsgType = _contest_id ? 'UPDATE_FAILED' : 'ADD_FAILED'
            let successMsgType = _contest_id ? 'UPDATE_SUCCESS' : 'ADD_SUCCESS'

            let _contest_icon;
            if (req.files.length > 0) {
                _contest_icon = req.files[0].path.replace('public', '')
                console.log(_contest_icon);

            }

            let new_start_date = joinDateTime(_start_date, _from_time);
            let new_end_date = joinDateTime(_end_date, _to_time);

            let show_from = null
            console.log(_show_from_date, _show_from_time);

            if (_show_from_date && _show_from_time) {
                show_from = joinDateTime(_show_from_date, _show_from_time);
            }

            if (!_contest_id) {

                _query = {
                    text: "INSERT INTO tbl_contest(app_id,contest_name,contest_type,contest_desc,start_date,end_date,from_time,to_time,max_players,winners,entry_fee,currency,profit_margin,debit_type,credit_type,win_amount,css_class,next_start_date,contest_priority,game_conf,status,created_by,created_at,publish_type,channel,show_upcoming,show_from,max_lives,min_player,rank_desc) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,now(),$23,$24,$25,$26,$27,$28,$29) RETURNING *",
                    values: [
                        _app_id, _contest_name, _contest_type, _contest_desc, new_start_date, new_end_date, _from_time, _to_time, _max_players, _winners, _entry_fee, _currency, _profit_margin, _debit_type, _credit_type, _win_amount, _css_class, _next_start_date, _contest_priority, _game_conf, _status, _created_by, _publish_type, _channel, _show_upcoming, show_from, _max_lives, _min_player, _rank_desc
                    ]
                }
            }
            else {

                _query = {
                    text: "UPDATE tbl_contest SET app_id=$1,contest_name=$2,contest_type=$3,contest_desc=$4,start_date=$5,end_date=$6,from_time=$7,to_time=$8,max_players=$9,winners=$10,entry_fee=$11,currency=$12,profit_margin=$13,debit_type=$14,credit_type=$15,win_amount=$16,css_class=$17,next_start_date=$18,contest_priority=$19,game_conf=$20,status=$21,updated_by=$22,updated_at=now(),publish_type = $24,channel=$25, show_upcoming=$26,show_from=$27, max_lives=$28, min_player=$29, rank_desc=$30 WHERE contest_id=$23 RETURNING *",
                    values: [
                        _app_id, _contest_name, _contest_type, _contest_desc, new_start_date, new_end_date, _from_time, _to_time, _max_players, _winners, _entry_fee, _currency, _profit_margin, _debit_type, _credit_type, _win_amount, _css_class, _next_start_date, _contest_priority, _game_conf, _status, _updated_by, _contest_id, _publish_type, _channel, _show_upcoming, show_from, _max_lives, _min_player, _rank_desc
                    ]
                }

            }

            try {

                let result = await pgConnection.executeQuery('rmg_dev_db', _query)

                console.log('result contest_id', result[0].contest_id);

                if (result.length > 0) {

                    if (_contest_clone_id) {
                        cloneRanks(_contest_clone_id, result[0].contest_id);
                    }

                    if (req.files != null && req.files.length > 0) {
                        let movePath = await uploadBanner(req, result[0].contest_id);

                        let mvQuery = {
                            text: "UPDATE tbl_contest set contest_icon = $1 WHERE contest_id= $2 RETURNING *",
                            values: [
                                movePath.replace('./public', ''),
                                result[0].contest_id
                            ]
                        }

                        let mvResult = await pgConnection.executeQuery('rmg_dev_db', mvQuery)

                        console.log(mvResult);
                    }

                    services.sendResponse.sendWithCode(req, res, result[0], customMsgType, successMsgType);

                } else {

                    services.sendResponse.sendWithCode(req, res, 'error', customMsgType, errMsgType);
                }
            }
            catch (error) {

                console.log(error);

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
                        console.log(sheetData);

                        // console.log(sheetData.rankData[0].contest_uid);

                        const queriesWithId = await getQueriesContestData(sheetData, _app_id)
                        // console.log(queriesWithId);


                        Promise.all(queriesWithId.map(async (querieWithId) => {
                            let query = querieWithId.query
                            let contest_uid = querieWithId.contest_uid

                            // console.log(query, contest_uid);

                            let contest_id = await pgConnection.executeQuery('rmg_dev_db', query)
                            // let contest_id = '123'
                            const queries = await getQueriesRankData(sheetData, contest_uid, contest_id[0].contest_id)


                            Promise.all(queries.map(async (query) => {
                                if (query != false) {
                                    return await pgConnection.executeQuery('rmg_dev_db', query);
                                }
                            })).then((inresults) => {
                                console.log(inresults);

                            })

                            return contest_id;

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

        let _contest_id = req.body.contest_id ? req.body.contest_id : null;
        let _contest_clone_id = req.body.contest_clone_id ? req.body.contest_clone_id : null;
        let _app_id = req.body.app_id ? req.body.app_id : null;
        let _contestname = req.body.contestname ? req.body.contestname : null;
        let _fromDate = req.body.frmdate ? req.body.frmdate : null;
        let _toDate = req.body.todate ? req.body.todate : null;
        let _status = req.body.status ? req.body.status : null;
        let _grep = req.body.grep ? req.body.grep : null;
        let _publish_type = req.body.publish_type ? req.body.publish_type : null;
        let _debit_type = req.body.debit_type ? req.body.debit_type : null;
        let _credit_type = req.body.credit_type ? req.body.credit_type : null;
        let _win_amount = req.body.win_amount ? req.body.win_amount : null;
        let _entry_fee = req.body.entry_fee ? req.body.entry_fee : null;
        let _max_players = req.body.max_players ? req.body.max_players : null;
        let _show_upcoming = req.body.show_upcoming ? req.body.show_upcoming : null;

        let _selectQuery = `select case when now()::timestamptz + (330::int * '1m'::interval) < start_date then true end as Upcoming, tbl_app.app_name,tbl_game_conf."level",tbl_contest.* from tbl_contest inner join tbl_app on tbl_app.app_id = tbl_contest.app_id left join tbl_game_conf on tbl_game_conf.game_conf = tbl_contest.game_conf WHERE  1=1`

        if (_contest_id) {
            _selectQuery += " AND contest_id = " + _contest_id
        }

        if (_contest_clone_id) {
            _selectQuery += " AND contest_id = " + _contest_clone_id
        }

        if (_app_id) {
            _selectQuery += " AND tbl_contest.app_id = '" + _app_id + "'"
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

            let _pt = _publish_type.map(v => `'${v}'`)

            _selectQuery += " AND publish_type in (" + _pt + ")"
        }

        if (_debit_type) {
            _selectQuery += " AND debit_type = '" + _debit_type + "'"
        }

        if (_credit_type) {
            _selectQuery += " AND credit_type = '" + _credit_type + "'"
        }

        if (_status) {
            _selectQuery += " AND tbl_contest.status = '" + _status + "'"
        }

        if (_max_players) {
            _selectQuery += " AND max_players = " + _max_players
        }

        if (_show_upcoming) {
            _selectQuery += " AND show_upcoming = " + _show_upcoming
        }

        if (_fromDate && _toDate) {
            _fromDate = _fromDate.split(' ');
            _toDate = _toDate.split(' ');
            let new_start_date = joinDateTime(_fromDate[0], _fromDate[1]);
            let new_end_date = joinDateTime(_toDate[0], _toDate[1]);
            _selectQuery += ` AND start_date >= '${new_start_date}' AND end_date <= '${new_end_date}'`
        }

        if (_grep && _grep == 'Live') {
            _selectQuery += ` AND now()::timestamptz + (330::int * '1m'::interval) between start_date and end_date`
        }

        if (_grep && _grep == 'Upcoming') {
            _selectQuery += ` AND now()::timestamptz + (330::int * '1m'::interval) < start_date `
        }

        _selectQuery += ' order by tbl_app.app_name,tbl_contest.start_date'


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

        let _selectQuery = `select tbl_app.app_name,tbl_contest.* from tbl_contest 
        inner join tbl_app on tbl_contest.app_id = tbl_app.app_id
        where 1=1
        and tbl_contest."status" = 'PENDING' and tbl_contest.app_id = ${app_id} order by from_time`
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

        let _selectQuery = `update tbl_contest set "status"='ACTIVE' where contest_id in (${pendingIds}) returning contest_id`
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

}

function joinDateTime(date, time) {
    let new_date = date + 'T' + time + 'Z';
    return new_date
}

async function uploadBanner(req, contest_id) {

    return new Promise((resolve, reject) => {

        let uploadFilepath = `./public/contest/${req.body.app_id}/${contest_id}/`;

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
                    Y: 'channel',
                    Z: 'show_upcoming',
                    AA: 'max_lives',
                    AB: 'min_player',
                    AC: 'rank_desc',
                    AD: 'show_from_date',
                    AE: 'show_from_time'
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
                object['from_time'] = getFormattedTime(object['from_time']);
                object['to_time'] = getFormattedTime(object['to_time']);

                object['start_date'] = joinDateTime(object['start_date'], object['from_time']);

                object['end_date'] = joinDateTime(object['end_date'], object['to_time']);
                if (object['show_from_date'] && object['show_from_time']) {
                    object['show_from_time'] = getFormattedTime(object['show_from_time']);
                    object['show_from'] = joinDateTime(object['show_from_date'], object['show_from_time'])
                }

                let count = 0;
                let cols = [];
                let values = [];
                let dollcount = []

                for (const key in object) {
                    if (object.hasOwnProperty(key) && (key != 'contest_uid' && key != 'is_repeat' && key != 'show_from_date' && key != 'show_from_time')) {

                        const element = object[key];

                        cols.push(key)

                        values.push(element)
                        count = count + 1;

                        dollcount.push(`$${count}`)

                    }
                }

                query = {
                    text: `INSERT INTO tbl_contest(${cols.toString()}) VALUES (${dollcount}) RETURNING contest_id`,
                    values: values
                }
                console.log(query, object['contest_uid']);
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

    min = (min != '0') ? min : '00'
    sec = (sec != '0') ? sec : '00'

    return hr + ':' + min + ':' + sec;
}

function getQueriesRankData(sheetData, contest_uid, contest_id) {

    return new Promise((resolve, reject) => {

        let queries = sheetData.rankData.map(object => {
            if (contest_uid == object['contest_uid']) {
                object['contest_id'] = contest_id

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
                    text: `INSERT INTO tbl_contest_rank(${cols.toString()}) VALUES (${dollcount}) RETURNING contest_rank_id`,
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

async function cloneRanks(contest_clone_id, contest_id) {

    console.log('contest_clone_id', contest_clone_id);
    console.log('contest_id', contest_id);

    let insertBulkRank = `INSERT INTO tbl_contest_rank(contest_id,rank_name,rank_desc,lower_rank,upper_rank,prize_amount,credit_type,status,created_by)
    select ${contest_id},rank_name,rank_desc,lower_rank,upper_rank,prize_amount,credit_type,status,created_by from tbl_contest_rank
    where contest_id = ${contest_clone_id} RETURNING rank_name`

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

async function getUpdateQuerie(liveContestOrder) {

    return new Promise((resolve, reject) => {
        let updateQuerie = []

        for (let i = 0; i < liveContestOrder.length; i++) {
            const contest_id = liveContestOrder[i];
            const priority = i;

            let _query = `update tbl_contest set contest_priority = ${priority} where contest_id =${contest_id} RETURNING contest_name,contest_priority`;

            updateQuerie.push(_query)
        }

        resolve(updateQuerie)
    });
}

async function getUpdateQueriesContestOrder(allContestOrder) {

    return new Promise((resolve, reject) => {
        let updateQuerie = []

        for (let i = 0; i < allContestOrder.length; i++) {
            const x = allContestOrder[i].split("-");
            const priority = i;

            let _query = `update tbl_contest set contest_priority = ${priority} where entry_fee =${x[0]} and debit_type='${x[1]}'`;

            updateQuerie.push(_query)
        }

        resolve(updateQuerie)
    });
}

