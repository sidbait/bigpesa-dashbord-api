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
            let _contest_master_id = req.body.contest_master_id ? req.body.contest_master_id : null;
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
            let _updated_by = null;
            let _contest_priority = req.body.contest_priority ? req.body.contest_priority : null;
            let _game_conf = req.body.game_conf ? req.body.game_conf : null;
            let _channel = req.body.channel ? req.body.channel : null;

            let _query;
            let errMsgType = _contest_id ? 'UPDATE_FAILED' : 'ADD_FAILED'
            let successMsgType = _contest_id ? 'UPDATE_SUCCESS' : 'ADD_SUCCESS'

            let _contest_icon;
            if (req.files.length > 0) {
                _contest_icon = req.files[0].path.replace('public', '')
                console.log(_contest_icon);

            }

            if (!_contest_id) {

                _query = {
                    text: "INSERT INTO tbl_contest(app_id,contest_name,contest_type,contest_desc,start_date,end_date,from_time,to_time,max_players,winners,entry_fee,currency,profit_margin,debit_type,credit_type,win_amount,css_class,next_start_date,contest_priority,game_conf,status,created_by,created_at,publish_type,channel,is_repeat) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,now(),$23,$24) RETURNING *",
                    values: [
                        _app_id, _contest_name, _contest_type, _contest_desc, _start_date, _end_date, _from_time, _to_time, _max_players, _winners, _entry_fee, _currency, _profit_margin, _debit_type, _credit_type, _win_amount, _css_class, _next_start_date, _contest_priority, _game_conf, _status, _created_by, _publish_type, _channel
                    ]
                }
            }
            else {

                _query = {
                    text: "UPDATE tbl_contest SET app_id=$1,contest_name=$2,contest_type=$3,contest_desc=$4,start_date=$5,end_date=$6,from_time=$7,to_time=$8,max_players=$9,winners=$10,entry_fee=$11,currency=$12,profit_margin=$13,debit_type=$14,credit_type=$15,win_amount=$16,css_class=$17,next_start_date=$18,contest_priority=$19,game_conf=$20,status=$21,updated_by=$22,updated_at=now(),publish_type = $24,channel=$25 WHERE contest_id=$23 RETURNING *",
                    values: [
                        _app_id, _contest_name, _contest_type, _contest_desc, _start_date, _end_date, _from_time, _to_time, _max_players, _winners, _entry_fee, _currency, _profit_margin, _debit_type, _credit_type, _win_amount, _css_class, _next_start_date, _contest_priority, _game_conf, _status, _updated_by, _contest_id, _publish_type, _channel
                    ]
                }

            }

            try {

                let result = await pgConnection.executeQuery('rmg_dev_db', _query)

                console.log(result);

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
        let _app_id = req.body.app_id ? req.body.app_id : null;
        let _contestname = req.body.contestname ? req.body.contestname : null;
        let _fromDate = req.body.frmdate ? req.body.frmdate : null;
        let _toDate = req.body.todate ? req.body.todate : null;
        let _status = req.body.status ? req.body.status : null;
        let _publish_type = req.body.publish_type ? req.body.publish_type : null;
        let _debit_type = req.body.debit_type ? req.body.debit_type : null;
        let _credit_type = req.body.credit_type ? req.body.credit_type : null;
        let _win_amount = req.body.win_amount ? req.body.win_amount : null;

        let _selectQuery = 'SELECT * FROM tbl_contest WHERE  1=1'

        if (_contest_id) {
            _selectQuery += " AND contest_id = " + _contest_id
        }

        if (_app_id) {
            _selectQuery += " AND app_id = '" + _app_id + "'"
        }

        if (_contestname) {
            _selectQuery += " AND contest_name = '" + _contestname + "'"
        }

        if (_win_amount) {
            _selectQuery += " AND win_amount = '" + _win_amount + "'"
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
            _selectQuery += " AND status = '" + _status + "'"
        }

        if (_fromDate && _toDate) {
            _fromDate = _fromDate.split(' ');
            _toDate = _toDate.split(' ');

            _selectQuery += ` AND start_date::date >= '${_fromDate[0]}' AND end_date::date <= '${_toDate[0]}' AND from_time >= '${_fromDate[1]}' AND to_time <= '${_toDate[1]}'`
        }

        // _selectQuery += ' LIMIT 50'


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