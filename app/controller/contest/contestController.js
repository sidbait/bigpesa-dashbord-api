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
            "profit_margin": 'required',
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
            let _game_conf = req.body.game_conf ? req.body.game_conf : null;
            let _channel = req.body.channel ? req.body.channel : null;
            let _show_upcoming = req.body.show_upcoming ? req.body.show_upcoming : null;

            console.log('_show_upcoming',_show_upcoming);

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

            if (!_contest_id) {

                _query = {
                    text: "INSERT INTO tbl_contest(app_id,contest_name,contest_type,contest_desc,start_date,end_date,from_time,to_time,max_players,winners,entry_fee,currency,profit_margin,debit_type,credit_type,win_amount,css_class,next_start_date,contest_priority,game_conf,status,created_by,created_at,publish_type,channel,show_upcoming) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,now(),$23,$24,$25) RETURNING *",
                    values: [
                        _app_id, _contest_name, _contest_type, _contest_desc, new_start_date, new_end_date, _from_time, _to_time, _max_players, _winners, _entry_fee, _currency, _profit_margin, _debit_type, _credit_type, _win_amount, _css_class, _next_start_date, _contest_priority, _game_conf, _status, _created_by, _publish_type, _channel, _show_upcoming
                    ]
                }
            }
            else {

                _query = {
                    text: "UPDATE tbl_contest SET app_id=$1,contest_name=$2,contest_type=$3,contest_desc=$4,start_date=$5,end_date=$6,from_time=$7,to_time=$8,max_players=$9,winners=$10,entry_fee=$11,currency=$12,profit_margin=$13,debit_type=$14,credit_type=$15,win_amount=$16,css_class=$17,next_start_date=$18,contest_priority=$19,game_conf=$20,status=$21,updated_by=$22,updated_at=now(),publish_type = $24,channel=$25, show_upcoming=$26 WHERE contest_id=$23 RETURNING *",
                    values: [
                        _app_id, _contest_name, _contest_type, _contest_desc, new_start_date, new_end_date, _from_time, _to_time, _max_players, _winners, _entry_fee, _currency, _profit_margin, _debit_type, _credit_type, _win_amount, _css_class, _next_start_date, _contest_priority, _game_conf, _status, _updated_by, _contest_id, _publish_type, _channel, _show_upcoming
                    ]
                }

            }

            try {

                let result = await pgConnection.executeQuery('rmg_dev_db', _query)

                console.log('result contest_id', result[0].contest_id);

                if (result.length > 0) {

                    if (_contest_clone_id) {
                        cloneRanks(_contest_clone_id,result[0].contest_id);
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
                        const sheetData = await readSheet(xlsxFilePath)
                        const queries = await getQueries(sheetData, _app_id)

                        Promise.all(queries.map(async (query) => {
                            return await pgConnection.executeQuery('rmg_dev_db', query);
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
                    services.sendResponse.sendWithCode(req, res, null, customMsgType, "ADD_FAILED");

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

        let _selectQuery = `select case when now()::timestamptz + (330::int * '1m'::interval) < start_date then true end as Upcoming, tbl_app.app_name,tbl_contest.* from tbl_contest inner join tbl_app on tbl_app.app_id = tbl_contest.app_id WHERE  1=1`

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
    }

}

function readSheet(xlsxFilePath) {
    return new Promise((resolve, reject) => {
        const result = excelToJson({
            sourceFile: xlsxFilePath,
            header: {
                rows: 1 // 2, 3, 4, etc.
            },
            columnToKey: {
                A: 'contest_name',
                B: 'contest_type',
                C: 'contest_desc',
                D: 'start_date',
                E: 'end_date',
                F: 'from_time',
                G: 'to_time',
                H: 'max_players',
                I: 'winners',
                J: 'entry_fee',
                K: 'currency',
                L: 'profit_margin',
                M: 'next_start_date',
                N: 'status',
                O: 'debit_type',
                P: 'credit_type',
                Q: 'win_amount',
                R: 'css_class',
                S: 'contest_priority',
                T: 'game_conf',
                U: 'contest_icon',
                V: 'publish_type',
                W: 'channel'
            }
        });
        resolve(result)
    });
}

function getQueries(sheetData, _app_id) {

    return new Promise((resolve, reject) => {

        let queries = sheetData.Sheet1.map(object => {

            object['app_id'] = _app_id
            object['from_time'] = getFormattedTime(object['from_time'])
            object['to_time'] = getFormattedTime(object['to_time'])
            let count = 0;
            let cols = [];
            let values = [];
            let dollcount = []

            for (const key in object) {
                if (object.hasOwnProperty(key)) {

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

            return query;
        })

        resolve(queries)
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

function add530(date, time) {
    let new_date = new Date(date + 'T' + time + 'Z');
    new_date.setHours(new_date.getHours() + 5);
    new_date.setMinutes(new_date.getMinutes() + 30);
    return new_date
}

function joinDateTime(date, time) {
    let new_date = date + 'T' + time + 'Z';
    return new_date
}

async function uploadBanner(req, contest_master_id) {

    return new Promise((resolve, reject) => {

        let uploadFilepath = `./public/contest/${req.body.app_id}/${contest_master_id}/`;

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

async function cloneRanks(contest_clone_id,contest_id) {

    console.log('contest_clone_id',contest_clone_id);
    console.log('contest_id',contest_id);

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