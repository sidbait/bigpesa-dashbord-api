var popUpRoutes = express.Router();

var validate = require('../../auth/validate');

var popUpController = require('../../controller/popUp/popUpController');

popUpRoutes.post('/search', popUpController.search);
popUpRoutes.post('/add', popUpController.add);

module.exports = popUpRoutes;