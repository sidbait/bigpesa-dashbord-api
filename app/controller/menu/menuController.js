const pgConnection = require('../../model/pgConnection');
const mv = require('mv');
const excelToJson = require('convert-excel-to-json');
const moment = require('moment')
const services = require('../../service/service');

const customMsgType = "MASTER_MESSAGE";
const customMsgTypeCM = "COMMON_MESSAGE";

module.exports = {

    getMenu: async function (req, res) {
        let userType = req.body.userType ? req.body.userType : null;

        switch (userType) {
            case 'Administrator':
                limit = {
                    Dashboard: true,
                    UserDetails: {
                        main: true,
                        users: true,
                        roles: true,
                    },
                    AppDetails: {
                        main: true,
                        app: true,
                        appversion: true,
                    },
                    EventDetails: {
                        main: true,
                        event: true,
                        winnerevent: true,
                        spinwheel: true,
                    },
                    ContestDetails: {
                        main: true,
                        mastercontest: true,
                        contest: true,
                    },
                    FeedbackDetails: {
                        main: true,
                        feedback: true,
                    },
                    Reports: {
                        main: true,
                        contest: true,
                        contestsummary: true,
                        gamesummary: true,
                        downloadsummary: true,
                        userreport: true,
                        cash: true,
                        paymentgateway: true,
                        acquisitionsummary: true,
                        acquisitiondetails: true,
                        userfunnel: true,
                        summary: true,
                        export: true,
                    }
                }
                break;
            case 'Maintainer':
                limit = {
                    Dashboard: true,
                    UserDetails: {
                        main: false,
                        users: false,
                        roles: false,
                    },
                    AppDetails: {
                        main: true,
                        app: true,
                        appversion: true,
                    },
                    EventDetails: {
                        main: false,
                        event: false,
                        winnerevent: false,
                        spinwheel: false,
                    },
                    ContestDetails: {
                        main: true,
                        mastercontest: true,
                        contest: true,
                    },
                    FeedbackDetails: {
                        main: true,
                        feedback: true,
                    },
                    Reports: {
                        main: true,
                        contest: false,
                        contestsummary: false,
                        gamesummary: false,
                        downloadsummary: false,
                        userreport: true,
                        cash: false,
                        paymentgateway: false,
                        acquisitionsummary: false,
                        acquisitiondetails: false,
                        userfunnel: false,
                        summary: false,
                        export: true,
                    }
                }
                break;
            case 'Reporting':
                limit = {
                    Dashboard: false,
                    UserDetails: {
                        main: false,
                        users: false,
                        roles: false,
                    },
                    AppDetails: {
                        main: false,
                        app: false,
                        appversion: false,
                    },
                    EventDetails: {
                        main: false,
                        event: false,
                        winnerevent: false,
                        spinwheel: false,
                    },
                    ContestDetails: {
                        main: false,
                        mastercontest: false,
                        contest: false,
                    },
                    FeedbackDetails: {
                        main: false,
                        feedback: false,
                    },
                    Reports: {
                        main: true,
                        contest: true,
                        contestsummary: true,
                        gamesummary: true,
                        downloadsummary: true,
                        userreport: true,
                        cash: true,
                        paymentgateway: true,
                        acquisitionsummary: true,
                        acquisitiondetails: true,
                        userfunnel: true,
                        summary: true,
                        export: true,
                    }
                }
                break;
            case 'Support':

                limit = {
                    Dashboard: false,
                    UserDetails: {
                        main: false,
                        users: false,
                        roles: false,
                    },
                    AppDetails: {
                        main: false,
                        app: false,
                        appversion: false,
                    },
                    EventDetails: {
                        main: false,
                        event: false,
                        winnerevent: false,
                        spinwheel: false,
                    },
                    ContestDetails: {
                        main: false,
                        mastercontest: false,
                        contest: false,
                    },
                    FeedbackDetails: {
                        main: true,
                        feedback: true,
                    },
                    Reports: {
                        main: true,
                        contest: false,
                        contestsummary: false,
                        gamesummary: false,
                        downloadsummary: false,
                        userreport: true,
                        cash: false,
                        paymentgateway: false,
                        acquisitionsummary: false,
                        acquisitiondetails: false,
                        userfunnel: false,
                        summary: false,
                        export: true,
                    }
                }
                break;
            case 'Default':
                limit = {

                }
                break;

            default:
                limit = {
                    Dashboard: false,
                    UserDetails: {
                        main: false,
                        users: false,
                        roles: false,
                    },
                    AppDetails: {
                        main: false,
                        app: false,
                        appversion: false,
                    },
                    EventDetails: {
                        main: false,
                        event: false,
                        winnerevent: false,
                        spinwheel: false,
                    },
                    ContestDetails: {
                        main: false,
                        mastercontest: false,
                        contest: false,
                    },
                    FeedbackDetails: {
                        main: false,
                        feedback: false,
                    },
                    Reports: {
                        main: false,
                        contest: false,
                        contestsummary: false,
                        gamesummary: false,
                        downloadsummary: false,
                        userreport: false,
                        cash: false,
                        paymentgateway: false,
                        acquisitionsummary: false,
                        acquisitiondetails: false,
                        userfunnel: false,
                        summary: false,
                        export: false,
                    }
                }
                break;
        }

        let menuItems = [
            {
                path: '/index',
                title: 'Dashboard',
                type: 'menu__link',
                show: limit.Dashboard,
                icontype: 'flaticon-line-graph'
            }, {
                path: '',
                title: 'User Details',
                type: 'menu__toggle',
                icontype: 'flaticon-users',
                show: limit.UserDetails.main,
                children: [
                    { path: '/master/manage-users/view-users', title: 'User', show: limit.UserDetails.users },
                    { path: '/master/manage-users/view-roles', title: 'Role', show: limit.UserDetails.roles },
                ]
            }, {
                path: '',
                title: 'App Details',
                type: 'menu__toggle',
                icontype: 'fa fa-mobile-alt',
                show: limit.AppDetails.main,
                children: [
                    { path: '/master/manage-app/view-app', title: 'App', show: limit.AppDetails.app },
                    { path: '/master/manage-app/app-version', title: 'App Version', show: limit.AppDetails.appversion },
                ]
            }, {
                path: '',
                title: 'Event Details',
                type: 'menu__toggle',
                icontype: 'fa fa-mobile-alt',
                show: limit.EventDetails.main,
                children: [
                    { path: '/master/manage-event/view-event', title: 'Events', show: limit.EventDetails.event, },
                    { path: '/master/manage-event/view-winner-event', title: 'Winner Event', show: limit.EventDetails.winnerevent, },
                    { path: '/master/manage-event/view-spin-wheel', title: 'Spin Wheel', show: limit.EventDetails.spinwheel, },
                ]
            }, {
                path: '',
                title: 'Contest Details',
                type: 'menu__toggle',
                icontype: 'fa fa-mobile-alt',
                show: limit.ContestDetails.main,
                children: [
                    { path: '/master/manage-master-contest/view-master-contest', title: 'Master Contest', show: limit.ContestDetails.mastercontest },
                    { path: '/master/manage-contest/view-contest', title: 'Contest', show: limit.ContestDetails.contest },
                ]
            }, {
                path: '',
                title: 'Feedback Details',
                type: 'menu__toggle',
                icontype: 'fa fa-mobile-alt',
                show: limit.FeedbackDetails.main,
                countClass: 'feedbackPendingCount',
                children: [
                    { path: '/master/feedback', title: 'Feedback', show: limit.FeedbackDetails.feedback },
                ]
            }, {
                path: '',
                title: 'Reports',
                type: 'menu__toggle',
                icontype: 'fa fa-mobile-alt',
                show: limit.Reports.main,
                children: [
                    { path: '/reports/contest', title: 'Contest Report', show: limit.Reports.contest, },
                    { path: '/reports/contestsummary', title: 'Contest Summary', show: limit.Reports.contestsummary, },
                    { path: '/reports/gamesummary', title: 'Top Game Summary', show: limit.Reports.gamesummary, },
                    { path: '/reports/downloadsummary', title: 'Download Summary', show: limit.Reports.downloadsummary, },
                    { path: '/reports/userreport', title: 'User Report', show: limit.Reports.userreport, },
                    { path: '/reports/cash', title: 'cash Report', show: limit.Reports.cash, },
                    { path: '/reports/paymentgateway', title: 'Payment Gateway Report', show: limit.Reports.paymentgateway, },
                    { path: '/reports/acquisitionsummary', title: 'Acquisition Summary', show: limit.Reports.acquisitionsummary, },
                    { path: '/reports/acquisitiondetails', title: 'Acquisition Details', show: limit.Reports.acquisitiondetails, },
                    { path: '/reports/userfunnel', title: 'User Funnel', show: limit.Reports.userfunnel, },
                    { path: '/reports/summary', title: 'Summary', show: limit.Reports.summary, },
                    { path: '/reports/export', title: 'Export & Bulk SMS', show: limit.Reports.export, }
                ]
            },

        ]

        services.sendResponse.sendWithCode(req, res, menuItems, customMsgType, "GET_SUCCESS");
    },

    getRules: async function (req, res) {

    },

}