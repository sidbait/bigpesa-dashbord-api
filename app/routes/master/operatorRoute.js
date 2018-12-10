var operatorRoutes = express.Router();

var validate = require('../../auth/validate');

var operatorController = require('../../controller/master/operatorController');

operatorRoutes.get('/operator/', function(req, res)
{
    operatorController.getAll(req, res);
});
operatorRoutes.post('/operator/add', function(req, res)
{
    operatorController.add(req, res);
});
operatorRoutes.post('/operator/update', function(req, res)
{
    operatorController.add(req, res);
});
operatorRoutes.post('/operator/search', function(req, res)
{
    // operatorController.search(req, res);
});

module.exports = operatorRoutes;