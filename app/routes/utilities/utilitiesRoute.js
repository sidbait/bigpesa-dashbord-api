var utilitiesRoutes = express.Router();

var utilitiesController = require('../../controller/utilities/utilitiesController');

utilitiesRoutes.post('/searchQueue', utilitiesController.searchQueue);
utilitiesRoutes.post('/getPendingData', utilitiesController.getPendingData);
utilitiesRoutes.post('/chgStatus', utilitiesController.chgStatus);
utilitiesRoutes.post('/runSQL', utilitiesController.runSQL);
utilitiesRoutes.post('/getWalletMatrix', utilitiesController.getWalletMatrix);
utilitiesRoutes.post('/updateMatrix', utilitiesController.updateMatrix);

utilitiesRoutes.post('/uploadImages', utilitiesController.uploadImages);
utilitiesRoutes.post('/showImages', utilitiesController.showImages);
utilitiesRoutes.post('/removeImage', utilitiesController.removeImage);

module.exports = utilitiesRoutes;