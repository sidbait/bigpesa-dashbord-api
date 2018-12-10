var languageRoutes = express.Router();

var validate = require('../../auth/validate');

var languageController = require('../../controller/master/languageController');

languageRoutes.get('/language/', function(req, res)
{
    languageController.getAll(req, res);
});
languageRoutes.post('/language/add', function(req, res)
{
    languageController.add(req, res);
});
languageRoutes.post('/language/update', function(req, res)
{
    languageController.add(req, res);
});
languageRoutes.post('/language/search', function(req, res)
{
    // countryController.search(req, res);
});

module.exports = languageRoutes;