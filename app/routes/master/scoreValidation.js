var appRoutes = express.Router();

var appController = require('../../controller/master/scoreValidationController');

appRoutes.post('/scoreValidation/getScoreData', appController.getScoreData);
appRoutes.post('/scoreValidation/updateScore', appController.add);


module.exports = appRoutes;