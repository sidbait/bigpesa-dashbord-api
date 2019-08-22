var appRoutes = express.Router();

var validate = require('../../auth/validate');

var appController = require('../../controller/engagement/msgScheduleReportController');

appRoutes.post('/msgschedulereport/getbasetypecount', function (req, res) {
    appController.getbasetypecount(req, res);
});

appRoutes.get('/msgschedulereport/getpendingcount', function (req, res) {
    appController.getPendingCount(req, res);
});

appRoutes.post('/msgschedulereport/addblockednumbers', function (req, res) {
    appController.addBlockedNumbers(req, res);
});

module.exports = appRoutes;