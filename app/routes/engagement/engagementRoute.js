const apiRoutes = express.Router();

//scratchCard routes

apiRoutes.use(require('./msgEventRoute'));
apiRoutes.use(require('./msgTemplateRoute'));
apiRoutes.use(require('./msgScheduleRoute'));
apiRoutes.use(require('./msgScheduleReportRoute'));
module.exports = apiRoutes;