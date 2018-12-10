var usertypeRoutes = express.Router();

var validate = require('../../auth/validate');

var usertypeController = require('../../controller/master/usertypeController');

usertypeRoutes.get('/usertype/', function(req, res)
{
    usertypeController.getAll(req, res);
});
usertypeRoutes.post('/usertype/add', function(req, res)
{
    usertypeController.add(req, res);
});
usertypeRoutes.post('/usertype/update', function(req, res)
{
    usertypeController.add(req, res);
});
usertypeRoutes.post('/usertype/search', function(req, res)
{
    // countryController.search(req, res);
});

module.exports = usertypeRoutes;