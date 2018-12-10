var appRoutes = express.Router();

var validate = require('../../auth/validate');

var appController = require('../../controller/master/appController');

appRoutes.get('/app', function(req, res)
{
    appController.getAll(req, res);
});

appRoutes.post('/app/add', function(req, res)
{
    console.log('aad');
    
    appController.add(req, res);
});

appRoutes.post('/app/update', function(req, res)
{
    appController.add(req, res);
});
appRoutes.post('/app/search', function(req, res)
{
    // appController.search(req, res);
});

module.exports = appRoutes;