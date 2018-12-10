var menuRoutes = express.Router();

var validate = require('../../auth/validate');

var menuController = require('../../controller/master/menuController');

menuRoutes.get('/menu/', function(req, res)
{
    menuController.getAll(req, res);
});
menuRoutes.post('/menu/add', function(req, res)
{
    menuController.add(req, res);
});
menuRoutes.post('/menu/update', function(req, res)
{
    menuController.add(req, res);
});
menuRoutes.post('/menu/search', function(req, res)
{
    // countryController.search(req, res);
});

module.exports = menuRoutes;