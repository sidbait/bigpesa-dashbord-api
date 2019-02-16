var dashboardRoutes = express.Router();

var dashboardController = require('../../controller/dashboard/dashboardController');

dashboardRoutes.get('/todaysDownloadSummary',dashboardController.todaysDownloadSummary);

dashboardRoutes.post('/cashSummary',dashboardController.cashSummary);

dashboardRoutes.get('/registeredVerifiedNotPlayed',dashboardController.registeredVerifiedNotPlayed);

dashboardRoutes.post('/registeredVerifiedNotPlayedDayWise',dashboardController.registeredVerifiedNotPlayedDayWise);

dashboardRoutes.get('/totalCashSummary',dashboardController.totalCashSummary);

dashboardRoutes.get('/todaysCounts',dashboardController.todaysCounts);

dashboardRoutes.get('/todaysCountsDebitCredit',dashboardController.todaysCountsDebitCredit);

dashboardRoutes.post('/appWiseActiveUsers',dashboardController.appWiseActiveUsers);

dashboardRoutes.post('/dayWiseActiveUsers',dashboardController.dayWiseActiveUsers);

dashboardRoutes.post('/totalUsersWithCashCoin',dashboardController.totalUsersWithCashCoin);

dashboardRoutes.post('/activeUsersWithCashCoin',dashboardController.activeUsersWithCashCoin);

dashboardRoutes.post('/inactiveUsersWithCashCoin',dashboardController.inactiveUsersWithCashCoin);

module.exports = dashboardRoutes;