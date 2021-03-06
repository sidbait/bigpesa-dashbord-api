var appRoutes = express.Router();

var validate = require('../../auth/validate');

var appController = require('../../controller/master/bannerController');

appRoutes.get('/banner', function (req, res) {
    appController.getAll(req, res);
});

appRoutes.post('/banner/add', function (req, res) {
    appController.add(req, res);
});

appRoutes.post('/banner/update', function (req, res) {
    appController.add(req, res);
});

appRoutes.post('/banner/search', function (req, res) {
    appController.search(req, res);
});

appRoutes.post('/banner/chgBannersOrder', appController.chgBannersOrder)

module.exports = appRoutes;