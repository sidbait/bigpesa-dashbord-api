var utilitiesRoutes = express.Router();

var utilitiesController = require('../../controller/utilities/utilitiesController');

utilitiesRoutes.post('/searchQueue', utilitiesController.searchQueue);
utilitiesRoutes.post('/getPendingData', utilitiesController.getPendingData);


module.exports = utilitiesRoutes;