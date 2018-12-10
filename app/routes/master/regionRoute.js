var regionRoutes = express.Router();

var validate = require('../../auth/validate');

var regionController = require('../../controller/master/regionController');

regionRoutes.get('/region/', function(req, res)
{
    regionController.getAll(req, res);
});
regionRoutes.post('/region/add', function(req, res)
{
    regionController.add(req, res);
});
regionRoutes.post('/region/update', function(req, res)
{
    regionController.add(req, res);
});
regionRoutes.post('/region/search', function(req, res)
{
    // countryController.search(req, res);
});

module.exports = regionRoutes;