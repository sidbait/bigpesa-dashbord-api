var partnerRoutes = express.Router();

var validate = require('../../auth/validate');

var partnerController = require('../../controller/master/partnerController');

partnerRoutes.get('/partner/', function(req, res)
{
    partnerController.getAll(req, res);
});
partnerRoutes.post('/partner/add', function(req, res)
{
    partnerController.add(req, res);
});
partnerRoutes.post('/partner/update', function(req, res)
{
    partnerController.add(req, res);
});
partnerRoutes.post('/partner/search', function(req, res)
{
    // countryController.search(req, res);
});

module.exports = partnerRoutes;