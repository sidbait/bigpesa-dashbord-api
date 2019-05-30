var appRoutes = express.Router();

var validate = require('../../auth/validate');

var appController = require('../../controller/scratchCard/scratchEventConroller');

appRoutes.get('/scratchevent', function (req, res) {
    appController.getAll(req, res);
});

appRoutes.post('/scratchevent/add', function (req, res) {
    appController.add(req, res);
});

appRoutes.post('/scratchevent/update', function (req, res) {
    appController.add(req, res);
});

appRoutes.post('/scratchevent/search', function (req, res) {
    appController.search(req, res);
});

module.exports = appRoutes;