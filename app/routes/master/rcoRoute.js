var rcoRoutes = express.Router();

var validate = require('../../auth/validate');

var rcoController = require('../../controller/master/rcoController');

rcoRoutes.get('/rco/', function(req, res)
{
    rcoController.getAll(req, res);
});
rcoRoutes.post('/rco/add', function(req, res)
{
    rcoController.add(req, res);
});
rcoRoutes.post('/rco/update', function(req, res)
{
    rcoController.add(req, res);
});
rcoRoutes.post('/rco/search', function(req, res)
{
    // countryController.search(req, res);
});

module.exports = rcoRoutes;