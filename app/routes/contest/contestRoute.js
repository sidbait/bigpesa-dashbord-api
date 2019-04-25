var contestRoutes = express.Router();

var validate = require('../../auth/validate');

var contestController = require('../../controller/contest/contestController');

contestRoutes.get('/', function(req, res)
{
    contestController.getAll(req, res);
});

contestRoutes.post('/add', function(req, res)
{ 
    contestController.add(req, res);
});

contestRoutes.post('/addbulk', function(req, res)
{ 
    contestController.addBulk(req, res);
});

contestRoutes.post('/update', function(req, res)
{
    contestController.add(req, res);
});

contestRoutes.post('/search', function(req, res)
{
    contestController.search(req, res);
});

contestRoutes.post('/updateContestStatus', function(req, res)
{ 
    contestController.updateContestStatus(req, res);
});

contestRoutes.post('/getRank', contestController.getRank);
contestRoutes.post('/getContestById', contestController.getContestById);
contestRoutes.post('/getContestLeaderboard', contestController.getContestLeaderboard);
contestRoutes.post('/getConfByAppId', contestController.getConfByAppId);
contestRoutes.post('/getPending', contestController.getPending);
contestRoutes.post('/enablePendingContest', contestController.enablePendingContest);

contestRoutes.post('/getLiveContest', contestController.getLiveContest);
contestRoutes.post('/setLiveContestOrder', contestController.setLiveContestOrder);

contestRoutes.post('/getAllContest', contestController.getAllContest);
contestRoutes.post('/setAllContestOrder', contestController.setAllContestOrder);

contestRoutes.post('/getMatrixCode', contestController.getMatrixCode);

module.exports = contestRoutes;