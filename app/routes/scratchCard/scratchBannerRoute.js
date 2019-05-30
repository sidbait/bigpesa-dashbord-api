var appRoutes = express.Router();

var validate = require('../../auth/validate');

var appController = require('../../controller/scratchCard/scratchBannerController');


appRoutes.get('/scratchbanner', function (req, res) {
    appController.getAll(req, res);
});

appRoutes.post('/scratchbanner/add', function (req, res) {
    appController.add(req, res);
});

appRoutes.post('/scratchbanner/update', function (req, res) {
    appController.add(req, res);
});

appRoutes.post('/scratchbanner/search', function (req, res) {
    appController.search(req, res);
});

appRoutes.post('/scratchbanner/chgBannersOrder', appController.chgBannersOrder)

module.exports = appRoutes;