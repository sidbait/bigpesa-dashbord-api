var appRoutes = express.Router();

var validate = require('../../auth/validate');

var appController = require('../../controller/scratchCard/scratchBannerDetailsController');


appRoutes.get('/scratchbannerDetails', function (req, res) {
    appController.getAll(req, res);
});

appRoutes.post('/scratchbannerDetails/add', function (req, res) {
    appController.add(req, res);
});

appRoutes.post('/scratchbannerDetails/update', function (req, res) {
    appController.add(req, res);
});

appRoutes.post('/scratchbannerDetails/search', function (req, res) {
    appController.search(req, res);
});

module.exports = appRoutes;