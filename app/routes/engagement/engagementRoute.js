const apiRoutes = express.Router();

//scratchCard routes

apiRoutes.use(require('./msgEventRoute'));
apiRoutes.use(require('./msgTemplateRoute'));
apiRoutes.use(require('./msgScheduleRoute'));
module.exports = apiRoutes;