var pixelRoutes = express.Router();

var validate = require('../../auth/validate');

var pixelController = require('../../controller/pixel/pixelController');

pixelRoutes.post('/report', pixelController.getpixelReport);

pixelRoutes.post('/getPixelConfiguration', pixelController.getPixelConfiguration);
pixelRoutes.post('/add', pixelController.add);

module.exports = pixelRoutes;