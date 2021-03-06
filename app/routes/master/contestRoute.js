var contestRoutes = express.Router();

var validate = require('../../auth/validate');

var contestController = require('../../controller/master/contestController');

contestRoutes.get('/contest', contestController.getAll);

contestRoutes.post('/contest/getPending', contestController.getPending);

contestRoutes.post('/contest/getRank', contestController.getRank);

contestRoutes.post('/contest/enablePendingContest', contestController.enablePendingContest);

contestRoutes.post('/contest/add', contestController.add);

contestRoutes.post('/contest/addbulk', contestController.addBulk);

contestRoutes.post('/contest/update', contestController.add);

contestRoutes.post('/contest/search', contestController.search);

contestRoutes.post('/contest/updateContestStatus', contestController.updateContestStatus);

contestRoutes.post('/contest/getContestById', contestController.getContestById);

contestRoutes.get('/contest/rebuildCache', contestController.rebuildCache);

contestRoutes.get('/contest/runContestCron', contestController.runContestCron);

contestRoutes.get('/contest/runRankCron', contestController.runRankCron);

contestRoutes.get('/contest/getentryfee', contestController.getEntryFee);

contestRoutes.post('/contest/getAllContest', contestController.getAllContest);
contestRoutes.post('/contest/setAllContestOrder', contestController.setAllContestOrder);
contestRoutes.post('/contest/removeRank', contestController.removeRank);

contestRoutes.post('/contest/addBanner', contestController.addBanner);
contestRoutes.post('/contest/removeImage', contestController.deleteBanner);

module.exports = contestRoutes;