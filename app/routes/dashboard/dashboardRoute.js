var dashboardRoutes = express.Router();

var validate = require('../../auth/validate');

var dashboardController = require('../../controller/dashboard/dashboardController');

dashboardRoutes.get('/todaysDownloadSummary', function (req, res) {
    dashboardController.todaysDownloadSummary(req, res);
});

dashboardRoutes.post('/cashSummary', function (req, res) {
    dashboardController.cashSummary(req, res);
});

dashboardRoutes.get('/registeredVerifiedNotPlayed', function (req, res) {
    dashboardController.registeredVerifiedNotPlayed(req, res);
});

dashboardRoutes.post('/registeredVerifiedNotPlayedDayWise', function (req, res) {
    dashboardController.registeredVerifiedNotPlayedDayWise(req, res);
});

dashboardRoutes.get('/todaysCashSummary', function (req, res) {
    dashboardController.todaysCashSummary(req, res);
});

dashboardRoutes.get('/todaysCounts', function (req, res) {
    dashboardController.todaysCounts(req, res);
});

dashboardRoutes.get('/todaysCountsDebitCredit', function (req, res) {
    dashboardController.todaysCountsDebitCredit(req, res);
});
// appWiseActiveUsers
dashboardRoutes.post('/appWiseActiveUsers', function (req, res) {
    dashboardController.appWiseActiveUsers(req, res);
});
module.exports = dashboardRoutes;