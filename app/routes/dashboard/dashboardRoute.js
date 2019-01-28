var dashboardRoutes = express.Router();

var validate = require('../../auth/validate');

var dashboardController = require('../../controller/dashboard/dashboardController');

dashboardRoutes.post('/downloadSummary', function (req, res) {
    dashboardController.downloadSummary(req, res);
});

dashboardRoutes.post('/cashSummary', function (req, res) {
    dashboardController.cashSummary(req, res);
});


module.exports = dashboardRoutes;