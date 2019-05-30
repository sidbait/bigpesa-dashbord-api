var appRoutes = express.Router();

var validate = require('../../auth/validate');

var appController = require('../../controller/scratchCard/scratchCampaignDetailsController');


appRoutes.get('/scratchCampaignDetails', function (req, res) {
    appController.getAll(req, res);
});

appRoutes.post('/scratchCampaignDetails/add', function (req, res) {
    appController.add(req, res);
});

appRoutes.post('/scratchCampaignDetails/update', function (req, res) {
    appController.add(req, res);
});

appRoutes.post('/scratchCampaignDetails/search', function (req, res) {
    appController.search(req, res);
});

module.exports = appRoutes;