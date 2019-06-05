const pgConnection = require('../../model/pgConnection');

const services = require('../../service/service');

const customMsgType = "MASTER_MESSAGE";
const customMsgTypeCM = "COMMON_MESSAGE";

module.exports = {

    getCampBanner: async function (req, res) {
        let _camp_id = req.body.camp_id ? req.body.camp_id : null;

        let _selectQuery = `select bm.banner_id, bm.image_url,cb.camp_id,
        case when cb.status = 'ACTIVE' then true end as mapped
        from tbl_scratch_banner_master bm 
        left join tbl_scratch_campaign_banner cb on bm.banner_id = cb.banner_id
        and camp_id = ${_camp_id}
        order by bm.banner_id`;

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

    mapCampBannerStatus: async function (req, res) {
        let rules = {
            "bannerList": 'required',
            "camp_id": 'required',
        }

        let validation = new services.validator(req.body, rules);



        if (validation.passes()) {

            let _bannerList = req.body.bannerList ? req.body.bannerList : null;
            let _userid = req.body.userid ? req.body.userid : null;
            // let _status = req.body.status ? req.body.status : null;
            let _camp_id = req.body.camp_id ? req.body.camp_id : null;

            Promise.all(_bannerList.map(async (data) => {
                let banner_id = data.split('|')[0];
                let isChecked = data.split('|')[1];
                let _status = isChecked == 'true' ? 'ACTIVE' : 'DEACTIVE';
                console.log('_status', _status, isChecked);

                let _query = `select * from tbl_scratch_campaign_banner where camp_id = ${_camp_id} and banner_id = ${banner_id}`;

                try {
                    let dbResult = await pgConnection.executeQuery('rmg_dev_db', _query)

                    if (dbResult && dbResult.length > 0) {

                        let _updateMe = `update tbl_scratch_campaign_banner set status = '${_status}' where camp_id = ${_camp_id} and banner_id = ${banner_id} RETURNING id`;

                        let updateResult = await pgConnection.executeQuery('rmg_dev_db', _updateMe)

                        return updateResult[0].id;

                    } else {
                        if (_status == 'ACTIVE') {

                            let _insertMe = `INSERT INTO public.tbl_scratch_campaign_banner (camp_id, banner_id, status, created_at, created_by) VALUES(${_camp_id}, ${banner_id}, '${_status}', now(), ${_userid}) RETURNING id`;

                            let insertResult = await pgConnection.executeQuery('rmg_dev_db', _insertMe)

                            return insertResult[0].id;

                        } else {
                            console.log('ignore');

                        }

                    }
                }
                catch (error) {
                    console.log(error);
                }
            })).then((result => {
                services.sendResponse.sendWithCode(req, res, result, customMsgType, "GET_SUCCESS");
            })).catch((err) => {
                services.sendResponse.sendWithCode(req, res, err, customMsgType, "GET_FAILED");
            })

        } else {
            services.sendResponse.sendWithCode(req, res, validation.errors.errors, customMsgTypeCM, "VALIDATION_FAILED");
        }

    },

}