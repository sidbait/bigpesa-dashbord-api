var appRoutes = express.Router();

var appController = require('../../controller/app/appController');

appRoutes.post('/player-register', appController.register);
appRoutes.post('/getDetails', appController.getDetails);
appRoutes.post('/getEvents', appController.getEvents);

module.exports = appRoutes;