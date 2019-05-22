var appRoutes = express.Router();

var referrerController = require('../../controller/master/referrerController');
var referrerGoalsController = require('../../controller/master/referrerGoalsController');

appRoutes.post('/referrer', referrerController.getAll);
appRoutes.post('/referrer/add', referrerController.add);
appRoutes.post('/referrer/update', referrerController.add);
appRoutes.post('/referrer/search', referrerController.search);

appRoutes.post('/referrerGoals/add', referrerGoalsController.add);
appRoutes.post('/referrerGoals/search', referrerGoalsController.search);

appRoutes.post('/getReferrerPlayerMaster', referrerGoalsController.getReferrerPlayerMaster);
appRoutes.post('/getReferrerTransaction', referrerGoalsController.getReferrerTransaction);


module.exports = appRoutes;