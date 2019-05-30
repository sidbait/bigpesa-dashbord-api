var appRoutes = express.Router();

var validate = require('../../auth/validate');

var appController = require('../../controller/scratchCard/scratchCampaignController');

appRoutes.get('/scratchcamp', function (req, res) {
    appController.getAll(req, res);
});

appRoutes.post('/scratchcamp/add', function (req, res) {
    appController.add(req, res);
});

appRoutes.post('/scratchcamp/update', function (req, res) {
    appController.add(req, res);
});

appRoutes.post('/scratchcamp/search', function (req, res) {
    appController.search(req, res);
});

module.exports = appRoutes;