var appRoutes = express.Router();

var validate = require('../../auth/validate');

var appController = require('../../controller/master/visitbonusController');

appRoutes.post('/visitbonus', appController.getAll);
appRoutes.post('/visitbonus/add', appController.add);
appRoutes.post('/visitbonus/update', appController.add);
appRoutes.post('/visitbonus/search', appController.search);

module.exports = appRoutes;