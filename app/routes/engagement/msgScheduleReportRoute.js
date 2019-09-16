var appRoutes = express.Router();

var validate = require('../../auth/validate');

var appController = require('../../controller/engagement/msgScheduleReportController');

appRoutes.post('/msgschedulereport/getbasetypecount', appController.getbasetypecount);

appRoutes.get('/msgschedulereport/getpendingcount', appController.getPendingCount);

appRoutes.post('/msgschedulereport/addblockednumbers', appController.addBlockedNumbers);

appRoutes.get('/msgschedulereport/messagelog', appController.getMessageLogCount);

appRoutes.get('/msgschedulereport/notificationlog', appController.getNotificationLogCount);

module.exports = appRoutes;