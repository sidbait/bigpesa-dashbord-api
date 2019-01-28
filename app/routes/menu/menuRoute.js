var menuRoutes = express.Router();

var menuController = require('../../controller/menu/menuController');

menuRoutes.post('/getMenu', function (req, res) {
    menuController.getMenu(req, res);
});

menuRoutes.post('/getRules', function (req, res) {
    menuController.getRules(req, res);
});

module.exports = menuRoutes;