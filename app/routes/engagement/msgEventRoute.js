var appRoutes = express.Router();

var validate = require('../../auth/validate');

var appController = require('../../controller/engagement/msgEventController');


appRoutes.post('/msgevent/add', function (req, res) {
    appController.add(req, res);
});

appRoutes.post('/msgevent/search', function (req, res) {
    appController.search(req, res);
});

module.exports = appRoutes;