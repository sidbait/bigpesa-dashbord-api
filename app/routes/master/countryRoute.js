var countryRoutes = express.Router();

var validate = require('../../auth/validate');

var countryController = require('../../controller/master/countryController');

countryRoutes.get('/country/', function(req, res)
{
    countryController.getAll(req, res);
});
countryRoutes.post('/country/add', function(req, res)
{
    countryController.add(req, res);
});
countryRoutes.post('/country/update', function(req, res)
{
    countryController.add(req, res);
});
countryRoutes.post('/country/search', function(req, res)
{
    // countryController.search(req, res);
});

module.exports = countryRoutes;