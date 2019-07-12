var appRoutes = express.Router();

var validate = require('../../auth/validate');

var appController = require('../../controller/scratchCard/scratchWinnerController');


appRoutes.get('/scratchwinner', function (req, res) {
    appController.getAll(req, res);
});

appRoutes.post('/scratchwinner/add', function (req, res) {
    appController.add(req, res);
});

appRoutes.post('/scratchwinner/update', function (req, res) {
    appController.add(req, res);
});

appRoutes.post('/scratchwinner/search', function (req, res) {
    appController.search(req, res);
});

module.exports = appRoutes;