var dashboardRoutes = express.Router();

var dashboardController = require('../../controller/dashboard/dashboardController');

dashboardRoutes.get('/todaysDownloadSummary',dashboardController.todaysDownloadSummary);

dashboardRoutes.post('/cashSummary',dashboardController.cashSummary);

dashboardRoutes.get('/registeredVerifiedNotPlayed',dashboardController.registeredVerifiedNotPlayed);

dashboardRoutes.post('/registeredVerifiedNotPlayedDayWise',dashboardController.registeredVerifiedNotPlayedDayWise);

dashboardRoutes.get('/todaysCashSummary',dashboardController.todaysCashSummary);

dashboardRoutes.get('/todaysCounts',dashboardController.todaysCounts);

dashboardRoutes.get('/todaysCountsDebitCredit',dashboardController.todaysCountsDebitCredit);

dashboardRoutes.post('/appWiseActiveUsers',dashboardController.appWiseActiveUsers);

dashboardRoutes.post('/dayWiseActiveUsers',dashboardController.dayWiseActiveUsers);

module.exports = dashboardRoutes;