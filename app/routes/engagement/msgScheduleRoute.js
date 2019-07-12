var appRoutes = express.Router();

var validate = require('../../auth/validate');

var appController = require('../../controller/engagement/msgScheduleController');

appRoutes.post('/msgschedule/add', function (req, res) {
    appController.add(req, res);
});

appRoutes.post('/msgschedule/search', function (req, res) {
    appController.search(req, res);
});

module.exports = appRoutes;