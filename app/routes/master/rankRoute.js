var appRoutes = express.Router();

var validate = require('../../auth/validate');

var appController = require('../../controller/master/rankController');

appRoutes.get('/rank', function(req, res)
{
    appController.getAll(req, res);
});

appRoutes.post('/rank/add', function(req, res)
{ 
    appController.add(req, res);
});

appRoutes.post('/rank/bulkInsert', function(req, res)
{ 
    appController.bulkInsert(req, res);
});

appRoutes.post('/rank/update', function(req, res)
{
    appController.add(req, res);
});

appRoutes.post('/rank/search', function(req, res)
{
    appController.search(req, res);
});

module.exports = appRoutes;