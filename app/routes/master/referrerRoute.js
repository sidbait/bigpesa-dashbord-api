var appRoutes = express.Router();

var validate = require('../../auth/validate');

var appController = require('../../controller/master/referrerController');

appRoutes.post('/referrer', appController.getAll);
appRoutes.post('/referrer/add', appController.add);
appRoutes.post('/referrer/update', appController.add);
appRoutes.post('/referrer/search', appController.search);
appRoutes.post('/referrer/getById', appController.getById);

module.exports = appRoutes;