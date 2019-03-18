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
            case 'Beta Mode':
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
                        visitbonus: true
                    },
                    BannerDetails: {
                        main: true,
                        banner: true
                    },
                    ContestDetails: {
                        main: true,
                        mastercontest: true,
                        contest: true,
                        previewcontest: true,
                    },
                    FeedbackDetails: {
                        main: true,
                        feedback: true,
                    },
                    Reports: {
                        main: true,
                        contest: false,
                        contestsummary: true,
                        gamesummary: true,
                        downloadsummary: true,
                        userreport: true,
                        cash: true,
                        paymentgateway: true,
                        acquisitionsummary: true,
                        channelAcquisitionsummary: true,
                        acquisitiondetails: true,
                        userfunnel: true,
                        summary: true,
                        dailySummary: true,
                        dailyChannelSummary: true,
                        export: true,
                        hourly: true,
                        splitWiseReport: true
                    },
                    UserReports: {
                        main: true,
                        PlayerReport: true,
                        approvedRefund: true,
                        refundReport: true,
                        UserCashReport: true,
                        UserContestReport: true,
                        ActiveUserReport: true,
                        UserRetention: true,
                        ChannelRetention: true
                    },
                    AcquisitionReports: {
                        main: true,
                        AcquisitionSummary: true,
                        AcquisitionDetails: true,
                        UserFunnel: true
                    },
                    Summary: {
                        main: true,
                        ContestReport: true,
                        ContestSummary: true,
                        TopGameSummary: true,
                        DownloadSummary: true
                    }
                }
                break;
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
                        visitbonus: true
                    },
                    BannerDetails: {
                        main: true,
                        banner: true
                    },
                    ContestDetails: {
                        main: true,
                        mastercontest: true,
                        contest: true,
                        previewcontest: true,
                    },
                    FeedbackDetails: {
                        main: true,
                        feedback: true,
                    },
                    Reports: {
                        main: true,
                        contest: false,
                        contestsummary: true,
                        gamesummary: true,
                        downloadsummary: true,
                        userreport: true,
                        cash: true,
                        paymentgateway: true,
                        acquisitionsummary: true,
                        channelAcquisitionsummary: true,
                        acquisitiondetails: true,
                        userfunnel: true,
                        summary: true,
                        dailySummary: true,
                        dailyChannelSummary: true,
                        export: true,
                        hourly: true,
                        splitWiseReport: true
                    },
                    UserReports: {
                        main: true,
                        PlayerReport: false,
                        approvedRefund: true,
                        refundReport: true,
                        UserCashReport: false,
                        UserContestReport: false,
                        ActiveUserReport: false,
                        UserRetention: true,
                        ChannelRetention: true
                    },
                    AcquisitionReports: {
                        main: false,
                        AcquisitionSummary: false,
                        AcquisitionDetails: false,
                        UserFunnel: false
                    },
                    Summary: {
                        main: false,
                        ContestReport: false,
                        ContestSummary: false,
                        TopGameSummary: false,
                        DownloadSummary: false
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
                        visitbonus: false
                    },
                    BannerDetails: {
                        main: false,
                        banner: false
                    },
                    ContestDetails: {
                        main: true,
                        mastercontest: true,
                        contest: true,
                        previewcontest: true,
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
                        channelAcquisitionsummary: false,
                        acquisitiondetails: false,
                        userfunnel: false,
                        summary: false,
                        dailySummary: false,
                        dailyChannelSummary: false,
                        export: true,
                        hourly: false,
                        splitWiseReport: true
                    },
                    UserReports: {
                        main: true,
                        PlayerReport: false,
                        approvedRefund: true,
                        refundReport: true,
                        UserCashReport: false,
                        UserContestReport: false,
                        ActiveUserReport: false,
                        UserRetention: true,
                        ChannelRetention: true
                    },
                    AcquisitionReports: {
                        main: false,
                        AcquisitionSummary: false,
                        AcquisitionDetails: false,
                        UserFunnel: false
                    },
                    Summary: {
                        main: false,
                        ContestReport: false,
                        ContestSummary: false,
                        TopGameSummary: false,
                        DownloadSummary: false
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
                        visitbonus: false
                    },
                    BannerDetails: {
                        main: false,
                        banner: false
                    },
                    ContestDetails: {
                        main: false,
                        mastercontest: false,
                        contest: false,
                        previewcontest: false,
                    },
                    FeedbackDetails: {
                        main: false,
                        feedback: false,
                    },
                    Reports: {
                        main: true,
                        contest: false,
                        contestsummary: true,
                        gamesummary: true,
                        downloadsummary: true,
                        userreport: true,
                        cash: true,
                        paymentgateway: true,
                        acquisitionsummary: true,
                        channelAcquisitionsummary: true,
                        acquisitiondetails: true,
                        userfunnel: true,
                        summary: true,
                        dailySummary: true,
                        dailyChannelSummary: true,
                        export: true,
                        hourly: true,
                        splitWiseReport: true
                    },
                    UserReports: {
                        main: false,
                        PlayerReport: false,
                        approvedRefund: false,
                        refundReport: false,
                        UserCashReport: false,
                        UserContestReport: false,
                        ActiveUserReport: false,
                        UserRetention: false,
                        ChannelRetention: false
                    },
                    AcquisitionReports: {
                        main: false,
                        AcquisitionSummary: false,
                        AcquisitionDetails: false,
                        UserFunnel: false
                    },
                    Summary: {
                        main: false,
                        ContestReport: false,
                        ContestSummary: false,
                        TopGameSummary: false,
                        DownloadSummary: false
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
                        visitbonus: false
                    },
                    BannerDetails: {
                        main: false,
                        banner: false
                    },
                    ContestDetails: {
                        main: false,
                        mastercontest: false,
                        contest: false,
                        previewcontest: false,
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
                        channelAcquisitionsummary: false,
                        acquisitiondetails: false,
                        userfunnel: false,
                        summary: false,
                        dailySummary: false,
                        dailyChannelSummary: false,
                        export: true,
                        hourly: false,
                        splitWiseReport: false
                    },
                    UserReports: {
                        main: true,
                        PlayerReport: false,
                        approvedRefund: false,
                        refundReport: true,
                        UserCashReport: false,
                        UserContestReport: false,
                        ActiveUserReport: false,
                        UserRetention: false,
                        ChannelRetention: false
                    },
                    AcquisitionReports: {
                        main: false,
                        AcquisitionSummary: false,
                        AcquisitionDetails: false,
                        UserFunnel: false
                    },
                    Summary: {
                        main: false,
                        ContestReport: false,
                        ContestSummary: false,
                        TopGameSummary: false,
                        DownloadSummary: false
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
                        visitbonus: false
                    },
                    BannerDetails: {
                        main: false,
                        banner: false
                    },
                    ContestDetails: {
                        main: false,
                        mastercontest: false,
                        contest: false,
                        previewcontest: false,
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
                        channelAcquisitionsummary: false,
                        acquisitiondetails: false,
                        userfunnel: false,
                        summary: false,
                        dailySummary: false,
                        dailyChannelSummary: false,
                        export: false,
                        hourly: false,
                        splitWiseReport: false
                    },
                    UserReports: {
                        main: false,
                        PlayerReport: false,
                        approvedRefund: false,
                        refundReport: false,
                        UserCashReport: false,
                        UserContestReport: false,
                        ActiveUserReport: false,
                        UserRetention: false,
                        ChannelRetention: false
                    },
                    AcquisitionReports: {
                        main: false,
                        AcquisitionSummary: false,
                        AcquisitionDetails: false,
                        UserFunnel: false
                    },
                    Summary: {
                        main: false,
                        ContestReport: false,
                        ContestSummary: false,
                        TopGameSummary: false,
                        DownloadSummary: false
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
                    { path: '/master/manage-event/view-visit-bonus', title: 'Visit Bonus', show: limit.EventDetails.visitbonus, },
                ]
            }, {
                path: '',
                title: 'Banner Details',
                type: 'menu__toggle',
                icontype: 'fa fa-mobile-alt',
                show: limit.BannerDetails.main,
                children: [
                    { path: '/master/manage-banner/view-banner', title: 'Banners', show: limit.BannerDetails.banner, }
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
                    { path: '/master/manage-contest/preview-contest', title: 'Preview Contest', show: limit.ContestDetails.previewcontest },
                ]
            }, {
                path: '',
                title: 'Feedback Details',
                type: 'menu__toggle',
                icontype: 'fa fa-mobile-alt',
                show: limit.FeedbackDetails.main,
                // countClass: 'feedbackPendingCount',
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
                    { path: '/reports/channelacquisitionsummary', title: 'Channel Acquisition Summary', show: limit.Reports.channelAcquisitionsummary, },
                    { path: '/reports/acquisitiondetails', title: 'Acquisition Details', show: limit.Reports.acquisitiondetails, },
                    { path: '/reports/userfunnel', title: 'User Funnel', show: limit.Reports.userfunnel, },
                    { path: '/reports/summary', title: 'Summary', show: limit.Reports.summary, },
                    { path: '/reports/dailysummary', title: 'Daily Summary', show: limit.Reports.dailySummary, },
                    { path: '/reports/dailychannelwisesummary', title: 'Daily channelwise Summary', show: limit.Reports.dailyChannelSummary, },
                    { path: '/reports/export', title: 'Export & Bulk SMS', show: limit.Reports.export, },
                    { path: '/reports/hourly', title: 'Hourly Report', show: limit.Reports.hourly, },
                    { path: '/reports/splitwisebalance', title: 'Splitwise Balance Report', show: limit.Reports.splitWiseReport, }
                ]
            },

            {
                path: '',
                title: 'User Reports',
                type: 'menu__toggle',
                icontype: 'fa fa-mobile-alt',
                show: limit.UserReports.main,
                children: [
                    { path: '/reports/contest', title: 'Player Report', show: limit.UserReports.PlayerReport, },
                    { path: '/master/player/approverefund', title: 'Approve Refund', show: limit.UserReports.approvedRefund, },
                    { path: '/reports/refund', title: 'Refund Report', show: limit.UserReports.refundReport, },
                    { path: '/reports/contestsummary', title: 'User Cash Report', show: limit.UserReports.UserCashReport, },
                    { path: '/reports/gamesummary', title: 'User Contest Report', show: limit.UserReports.UserContestReport, },
                    { path: '/reports/downloadsummary', title: 'Active User Report', show: limit.UserReports.ActiveUserReport, },
                    { path: '/reports/retention', title: 'User Retention', show: limit.UserReports.UserRetention, },
                    { path: '/reports/channelretention', title: 'Channel Retention', show: limit.UserReports.ChannelRetention, }
                ]
            },

            {
                path: '',
                title: 'Acquisition Reports',
                type: 'menu__toggle',
                icontype: 'fa fa-mobile-alt',
                show: limit.AcquisitionReports.main,
                children: [

                    { path: '/reports/acquisitionsummary', title: 'AcquisitionSummary', show: limit.AcquisitionReports.AcquisitionSummary, },
                    { path: '/reports/acquisitiondetails', title: 'AcquisitionDetails', show: limit.AcquisitionReports.AcquisitionDetails, },
                    { path: '/reports/userfunnel', title: 'User Funnel', show: limit.AcquisitionReports.UserFunnel, }
                ]
            },


            {
                path: '',
                title: 'Summary',
                type: 'menu__toggle',
                icontype: 'fa fa-mobile-alt',
                show: limit.Summary.main,
                children: [
                    { path: '/reports/contest', title: 'Contest Report', show: limit.Summary.ContestReport, },
                    { path: '/reports/contestsummary', title: 'Contest Summary', show: limit.Summary.ContestSummary, },
                    { path: '/reports/gamesummary', title: 'Top Game Summary', show: limit.Summary.TopGameSummary, },
                    { path: '/reports/downloadsummary', title: 'Download Summary', show: limit.Summary.DownloadSummary, }
                ]
            },

        ]

        services.sendResponse.sendWithCode(req, res, menuItems, customMsgType, "GET_SUCCESS");
    },

    getRules: async function (req, res) {

    },

}