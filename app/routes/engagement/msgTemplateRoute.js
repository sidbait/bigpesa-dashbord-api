var appRoutes = express.Router();

var validate = require('../../auth/validate');

var appController = require('../../controller/engagement/msgTemplateController');


appRoutes.post('/msgtemplate/add', function (req, res) {
    appController.add(req, res);
});

appRoutes.post('/msgtemplate/search', function (req, res) {
    appController.search(req, res);
});

module.exports = appRoutes;