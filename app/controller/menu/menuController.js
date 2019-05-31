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
                        BulkGameConf: false,
                        appversion: true,
                    },
                    EventDetails: {
                        main: true,
                        event: true,
                        winnerevent: true,
                        spinwheel: true,
                        scoreValidation: true,
                        visitbonus: true
                    },
                    BannerDetails: {
                        main: true,
                        banner: true
                    },
                    Utilities: {
                        main: true,
                        QueueReports: true,
                        RunSql: true,
                        WalletMatrix: true,
                        UploadImages: true,
                    },
                    ContestDetails: {
                        main: true,
                        mastercontest: true,
                        contest: true,
                        ContestPriority: true,
                        previewcontest: true,
                    },
                    ReferrerManagement: {
                        main: false,
                        Referrer: false,
                        Goals: false,
                        PlayerMaster: false,
                        PlayerTransaction: false,
                    },
                    ScratchCardManagement: {
                        main: false,
                        ScratchBanner: false,
                        ScratchCampaign: false,
                        ScratchEvent: false,
                        ScratchPrize: false,
                        ScratchCampaignBanner: false,
                    },
                    FeedbackDetails: {
                        main: false,
                        feedback: false,
                    },
                    Engagement:{
                        main: true,
                        bulkNotification: true,
                        reports:false
                    },
                    Reports: {
                        main: true,
                        contest: false,
                        contestsummary: true,
                        gamesummary: true,
                        downloadsummary: true,
                        userreport: true,
                        cash: true,
                        cashFlowSummary: true,
                        dailyReportSummary: true,
                        withdrawDepositReport: true,
                        paymentgateway: true,
                        acquisitionsummary: true,
                        channelAcquisitionsummary: true,
                        acquisitiondetails: true,
                        summary: false,
                        hourly: true,
                        splitWiseReport: true,
                        pixel: true,
                    },
                    UserReports: {
                        main: true,
                        PlayerReport: true,
                        approvedRefund: true,
                        approvedPlayer: true,
                        refundReport: true,
                        UserCashReport: true,
                        UserContestReport: true,
                        ActiveUserReport: true,
                        UserRetention: true,
                        ChannelRetention: true,
                        sourceRetention: true
                    },
                    AcquisitionReports: {
                        main: true,
                        AcquisitionSummary: true,
                        AcquisitionDetails: true
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
                        BulkGameConf: false,
                        appversion: true,
                    },
                    EventDetails: {
                        main: true,
                        event: true,
                        winnerevent: true,
                        spinwheel: true,
                        scoreValidation: true,
                        visitbonus: true
                    },
                    BannerDetails: {
                        main: true,
                        banner: true
                    },
                    Utilities: {
                        main: true,
                        QueueReports: true,
                        RunSql: true,
                        WalletMatrix: true,
                        UploadImages: true,
                    },
                    ContestDetails: {
                        main: true,
                        mastercontest: true,
                        contest: true,
                        ContestPriority: true,
                        previewcontest: true,
                    },
                    ReferrerManagement: {
                        main: true,
                        Referrer: true,
                        Goals: true,
                        PlayerMaster: true,
                        PlayerTransaction: true,
                    },
                    ScratchCardManagement: {
                        main: true,
                        ScratchBanner: true,
                        ScratchCampaign: true,
                        ScratchEvent: true,
                        ScratchPrize: true,
                        ScratchCampaignBanner: true,
                    },
                    FeedbackDetails: {
                        main: false,
                        feedback: false,
                    },
                    Engagement:{
                        main: true,
                        bulkNotification: true,
                        reports:false
                    },
                    Reports: {
                        main: true,
                        contest: false,
                        contestsummary: true,
                        gamesummary: true,
                        downloadsummary: true,
                        userreport: true,
                        cash: true,
                        cashFlowSummary: true,
                        dailyReportSummary: true,
                        withdrawDepositReport: true,
                        paymentgateway: true,
                        acquisitionsummary: true,
                        channelAcquisitionsummary: true,
                        acquisitiondetails: true,
                        summary: false,
                        hourly: true,
                        pixel: true,
                        splitWiseReport: true
                    },
                    UserReports: {
                        main: true,
                        PlayerReport: false,
                        approvedRefund: true,
                        approvedPlayer: true,
                        refundReport: true,
                        UserCashReport: false,
                        UserContestReport: false,
                        ActiveUserReport: false,
                        UserRetention: true,
                        ChannelRetention: true,
                        sourceRetention: true
                    },
                    AcquisitionReports: {
                        main: false,
                        AcquisitionSummary: false,
                        AcquisitionDetails: false
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
                        BulkGameConf: false,
                        appversion: true,
                    },
                    EventDetails: {
                        main: false,
                        event: false,
                        winnerevent: false,
                        spinwheel: false,
                        scoreValidation: false,
                        visitbonus: false
                    },
                    BannerDetails: {
                        main: false,
                        banner: false
                    },
                    Utilities: {
                        main: false,
                        QueueReports: false,
                        RunSql: false,
                        WalletMatrix: false,
                        UploadImages: true,
                    },
                    ContestDetails: {
                        main: true,
                        mastercontest: true,
                        contest: true,
                        ContestPriority: true,
                        previewcontest: true,
                    },
                    ReferrerManagement: {
                        main: false,
                        Referrer: false,
                        Goals: false,
                        PlayerMaster: false,
                        PlayerTransaction: false,
                    },
                    ScratchCardManagement: {
                        main: false,
                        ScratchBanner: false,
                        ScratchCampaign: false,
                        ScratchEvent: false,
                        ScratchPrize: false,
                        ScratchCampaignBanner: false,
                    },
                    FeedbackDetails: {
                        main: false,
                        feedback: false,
                    },
                    Engagement:{
                        main: true,
                        bulkNotification: true,
                        reports:false
                    },
                    Reports: {
                        main: true,
                        contest: false,
                        contestsummary: false,
                        gamesummary: false,
                        downloadsummary: false,
                        userreport: true,
                        cash: false,
                        cashFlowSummary: false,
                        dailyReportSummary: false,
                        withdrawDepositReport: false,
                        paymentgateway: false,
                        acquisitionsummary: false,
                        channelAcquisitionsummary: false,
                        acquisitiondetails: false,
                        summary: false,
                        hourly: false,
                        pixel: true,
                        splitWiseReport: true
                    },
                    UserReports: {
                        main: true,
                        PlayerReport: false,
                        approvedRefund: true,
                        approvedPlayer: true,
                        refundReport: true,
                        UserCashReport: false,
                        UserContestReport: false,
                        ActiveUserReport: false,
                        UserRetention: true,
                        ChannelRetention: true,
                        sourceRetention: true
                    },
                    AcquisitionReports: {
                        main: false,
                        AcquisitionSummary: false,
                        AcquisitionDetails: false
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
                        BulkGameConf: false,
                        appversion: false,
                    },
                    EventDetails: {
                        main: false,
                        event: false,
                        winnerevent: false,
                        spinwheel: false,
                        scoreValidation: false,
                        visitbonus: false
                    },
                    BannerDetails: {
                        main: false,
                        banner: false
                    },
                    Utilities: {
                        main: false,
                        QueueReports: false,
                        RunSql: false,
                        WalletMatrix: false,
                        UploadImages: false,
                    },
                    ContestDetails: {
                        main: false,
                        mastercontest: false,
                        contest: false,
                        ContestPriority: false,
                        previewcontest: false,
                    },
                    ReferrerManagement: {
                        main: false,
                        Referrer: false,
                        Goals: false,
                        PlayerMaster: false,
                        PlayerTransaction: false,
                    },
                    ScratchCardManagement: {
                        main: false,
                        ScratchBanner: false,
                        ScratchCampaign: false,
                        ScratchEvent: false,
                        ScratchPrize: false,
                        ScratchCampaignBanner: false,
                    },
                    FeedbackDetails: {
                        main: false,
                        feedback: false,
                    },
                    Engagement:{
                        main: true,
                        bulkNotification: true,
                        reports:false
                    },
                    Reports: {
                        main: true,
                        contest: false,
                        contestsummary: true,
                        gamesummary: true,
                        downloadsummary: true,
                        userreport: true,
                        cash: true,
                        cashFlowSummary: true,
                        dailyReportSummary: true,
                        withdrawDepositReport: true,
                        paymentgateway: true,
                        acquisitionsummary: true,
                        channelAcquisitionsummary: true,
                        acquisitiondetails: true,
                        summary: false,
                        hourly: true,
                        pixel: true,
                        splitWiseReport: true
                    },
                    UserReports: {
                        main: false,
                        PlayerReport: false,
                        approvedRefund: false,
                        approvedPlayer: false,
                        refundReport: false,
                        UserCashReport: false,
                        UserContestReport: false,
                        ActiveUserReport: false,
                        UserRetention: false,
                        ChannelRetention: false,
                        sourceRetention: false
                    },
                    AcquisitionReports: {
                        main: false,
                        AcquisitionSummary: false,
                        AcquisitionDetails: false
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
                        BulkGameConf: false,
                        appversion: false,
                    },
                    EventDetails: {
                        main: false,
                        event: false,
                        winnerevent: false,
                        spinwheel: false,
                        scoreValidation: false,
                        visitbonus: false
                    },
                    BannerDetails: {
                        main: false,
                        banner: false
                    },
                    Utilities: {
                        main: false,
                        QueueReports: false,
                        RunSql: false,
                        WalletMatrix: false,
                        UploadImages: false,
                    },
                    ContestDetails: {
                        main: false,
                        mastercontest: false,
                        contest: false,
                        ContestPriority: false,
                        previewcontest: false,
                    },
                    ReferrerManagement: {
                        main: false,
                        Referrer: false,
                        Goals: false,
                        PlayerMaster: false,
                        PlayerTransaction: false,
                    },
                    ScratchCardManagement: {
                        main: false,
                        ScratchBanner: false,
                        ScratchCampaign: false,
                        ScratchEvent: false,
                        ScratchPrize: false,
                        ScratchCampaignBanner: false,
                    },
                    FeedbackDetails: {
                        main: false,
                        feedback: false,
                    },
                    Engagement:{
                        main: false,
                        bulkNotification: false,
                        reports:false
                    },
                    Reports: {
                        main: true,
                        contest: false,
                        contestsummary: false,
                        gamesummary: false,
                        downloadsummary: false,
                        userreport: true,
                        cash: false,
                        cashFlowSummary: false,
                        dailyReportSummary: false,
                        withdrawDepositReport: false,
                        paymentgateway: false,
                        acquisitionsummary: false,
                        channelAcquisitionsummary: false,
                        acquisitiondetails: false,
                        summary: false,
                        hourly: false,
                        pixel: false,
                        splitWiseReport: false
                    },
                    UserReports: {
                        main: true,
                        PlayerReport: false,
                        approvedRefund: false,
                        approvedPlayer: false,
                        refundReport: true,
                        UserCashReport: false,
                        UserContestReport: false,
                        ActiveUserReport: false,
                        UserRetention: false,
                        ChannelRetention: false,
                        sourceRetention: false
                    },
                    AcquisitionReports: {
                        main: false,
                        AcquisitionSummary: false,
                        AcquisitionDetails: false
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
                        BulkGameConf: false,
                        appversion: false,
                    },
                    EventDetails: {
                        main: false,
                        event: false,
                        winnerevent: false,
                        spinwheel: false,
                        scoreValidation: false,
                        visitbonus: false
                    },
                    BannerDetails: {
                        main: false,
                        banner: false
                    },
                    Utilities: {
                        main: false,
                        QueueReports: false,
                        RunSql: false,
                        WalletMatrix: false,
                        UploadImages: false,
                    },
                    ContestDetails: {
                        main: false,
                        mastercontest: false,
                        contest: false,
                        ContestPriority: false,
                        previewcontest: false,
                    },
                    ReferrerManagement: {
                        main: false,
                        Referrer: false,
                        Goals: false,
                        PlayerMaster: false,
                        PlayerTransaction: false,
                    },
                    ScratchCardManagement: {
                        main: false,
                        ScratchBanner: false,
                        ScratchCampaign: false,
                        ScratchEvent: false,
                        ScratchPrize: false,
                        ScratchCampaignBanner: false,
                    },
                    FeedbackDetails: {
                        main: false,
                        feedback: false,
                    },
                    Engagement:{
                        main: false,
                        bulkNotification: false,
                        reports:false
                    },
                    Reports: {
                        main: false,
                        contest: false,
                        contestsummary: false,
                        gamesummary: false,
                        downloadsummary: false,
                        userreport: false,
                        cash: false,
                        cashFlowSummary: false,
                        dailyReportSummary: false,
                        withdrawDepositReport: false,
                        paymentgateway: false,
                        acquisitionsummary: false,
                        channelAcquisitionsummary: false,
                        acquisitiondetails: false,
                        summary: false,
                        hourly: false,
                        pixel: false,
                        splitWiseReport: false
                    },
                    UserReports: {
                        main: false,
                        PlayerReport: false,
                        approvedRefund: false,
                        approvedPlayer: false,
                        refundReport: false,
                        UserCashReport: false,
                        UserContestReport: false,
                        ActiveUserReport: false,
                        UserRetention: false,
                        ChannelRetention: false,
                        sourceRetention: false
                    },
                    AcquisitionReports: {
                        main: false,
                        AcquisitionSummary: false,
                        AcquisitionDetails: false
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
                icontype: 'fas fa-chart-line'
            }, {
                path: '',
                title: 'User Details',
                type: 'menu__toggle',
                icontype: 'fas fa-user-cog',
                show: limit.UserDetails.main,
                children: [
                    { path: '/master/manage-users/view-users', title: 'User', show: limit.UserDetails.users },
                    { path: '/master/manage-users/view-roles', title: 'Role', show: limit.UserDetails.roles },
                ]
            }, {
                path: '',
                title: 'App Details',
                type: 'menu__toggle',
                icontype: 'fas fa-gamepad',
                show: limit.AppDetails.main,
                children: [
                    { path: '/master/manage-app/view-app', title: 'App', show: limit.AppDetails.app },
                    { path: '/master/manage-app/app-version', title: 'App Version', show: limit.AppDetails.appversion },
                    { path: '/master/manage-app/bulk-game-conf', title: 'Bulk GameConf', show: limit.AppDetails.BulkGameConf },
                ]
            }, {
                path: '',
                title: 'Event Details',
                type: 'menu__toggle',
                icontype: 'fas fa-calendar-alt',
                show: limit.EventDetails.main,
                children: [
                    { path: '/master/manage-event/view-event', title: 'Events', show: limit.EventDetails.event, },
                    { path: '/master/manage-event/view-winner-event', title: 'Winner Event', show: limit.EventDetails.winnerevent, },
                    { path: '/master/manage-event/view-spin-wheel', title: 'Spin Wheel', show: limit.EventDetails.spinwheel, },
                    { path: '/master/manage-event/view-visit-bonus', title: 'Visit Bonus', show: limit.EventDetails.visitbonus, },
                    { path: '/master/manage-event/score-validation', title: 'Score Validation', show: limit.EventDetails.scoreValidation, },
                ]
            }, {
                path: '',
                title: 'Banner Details',
                type: 'menu__toggle',
                icontype: 'far fa-images',
                show: limit.BannerDetails.main,
                children: [
                    { path: '/master/manage-banner/view-banner', title: 'Banners', show: limit.BannerDetails.banner, }
                ]
            }, {
                path: '',
                title: 'Utilities',
                type: 'menu__toggle',
                icontype: 'fas fa-toolbox',
                show: limit.Utilities.main,
                children: [
                    { path: '/utilities/queue-reports', title: 'QueueReports', show: limit.Utilities.QueueReports, },
                    { path: '/utilities/run-sql', title: 'Run Sql', show: limit.Utilities.RunSql, },
                    { path: '/utilities/wallet-matrix', title: 'Wallet Matrix', show: limit.Utilities.WalletMatrix, },
                    { path: '/utilities/upload-images', title: 'Upload Images', show: limit.Utilities.UploadImages, }
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
                    { path: '/master/manage-contest/contest-priority', title: 'Contest Priority', show: limit.ContestDetails.ContestPriority },
                ]
            }, {
                path: '',
                title: 'Referrer Details',
                type: 'menu__toggle',
                icontype: 'fas fa-users',
                show: limit.ReferrerManagement.main,
                children: [
                    { path: '/master/referrer-management/referrer-master', title: 'Referrer', show: limit.ReferrerManagement.Referrer },
                    { path: '/master/referrer-management/referrer-goals', title: 'Goals', show: limit.ReferrerManagement.Goals },
                    { path: '/master/referrer-management/referrer-player-master', title: 'Player Master', show: limit.ReferrerManagement.PlayerMaster },
                    { path: '/master/referrer-management/referrer-player-transaction', title: 'Player Transaction', show: limit.ReferrerManagement.PlayerTransaction },
                ]
            }, {
                path: '',
                title: 'Scratch Card',
                type: 'menu__toggle',
                icontype: 'fab fa-lastfm-square',
                show: limit.ScratchCardManagement.main,
                children: [
                    { path: '/master/scratch-card-management/scratch-banner', title: 'Scratch Banner', show: limit.ScratchCardManagement.ScratchBanner },
                    { path: '/master/scratch-card-management/scratch-campaign', title: 'Scratch Campaign', show: limit.ScratchCardManagement.ScratchCampaign },
                    { path: '/master/scratch-card-management/scratch-event', title: 'Scratch Event', show: limit.ScratchCardManagement.ScratchEvent },
                    { path: '/master/scratch-card-management/scratch-prize', title: 'Scratch Prize', show: limit.ScratchCardManagement.ScratchPrize },
                    { path: '/master/scratch-card-management/scratch-campaign-banner', title: 'Scratch Campaign Banner', show: limit.ScratchCardManagement.ScratchCampaignBanner },
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
                title: 'Engagement',
                type: 'menu__toggle',
                icontype: 'fas fa-users-cog',
                show: limit.Engagement.main,
                children: [
                    { path: '/reports/exportnotification', title: 'Notification', show: limit.Reports.bulkNotification, },
                    { path: '/reports/bulknotification', title: 'Reports', show: limit.Reports.reports, }                    
                ]
            }, {
                path: '',
                title: 'Reports',
                type: 'menu__toggle',
                icontype: 'fas fa-chart-bar',
                show: limit.Reports.main,
                children: [
                    { path: '/reports/contest', title: 'Contest Report', show: limit.Reports.contest, },
                    { path: '/reports/contestsummary', title: 'Contest Summary', show: limit.Reports.contestsummary, },
                    { path: '/reports/gamesummary', title: 'Top Game Summary', show: limit.Reports.gamesummary, },
                    { path: '/reports/downloadsummary', title: 'Download Summary', show: limit.Reports.downloadsummary, },
                    { path: '/reports/userreport', title: 'User Report', show: limit.Reports.userreport, },
                    { path: '/reports/cash', title: 'Cash Report', show: limit.Reports.cash, },
                    { path: '/reports/cashflowsummary', title: 'Cash Flow Summary', show: limit.Reports.cashFlowSummary, },
                    { path: '/reports/dailysummaryreport', title: 'Daily Summary Report', show: limit.Reports.dailyReportSummary, },
                    { path: '/reports/withdrawdepositreport', title: 'Withdraw Deposit Report', show: limit.Reports.withdrawDepositReport, },
                    { path: '/reports/paymentgateway', title: 'Payment Gateway Report', show: limit.Reports.paymentgateway, },
                    { path: '/reports/acquisitionsummary', title: 'Acquisition Summary', show: limit.Reports.acquisitionsummary, },
                    { path: '/reports/channelacquisitionsummary', title: 'Channel Acquisition Summary', show: limit.Reports.channelAcquisitionsummary, },
                    { path: '/reports/acquisitiondetails', title: 'Acquisition Details', show: limit.Reports.acquisitiondetails, },
                    { path: '/reports/summary', title: 'Summary', show: limit.Reports.summary, },
                    { path: '/reports/hourly', title: 'Hourly Report', show: limit.Reports.hourly, },
                    { path: '/reports/splitwisebalance', title: 'Splitwise Balance Report', show: limit.Reports.splitWiseReport, },
                    { path: '/reports/pixel', title: 'Pixel Report', show: limit.Reports.pixel, }
                ]
            },

            {
                path: '',
                title: 'User Reports',
                type: 'menu__toggle',
                icontype: 'fas fa-chart-pie',
                show: limit.UserReports.main,
                children: [
                    { path: '/reports/contest', title: 'Player Report', show: limit.UserReports.PlayerReport, },
                    { path: '/master/player/approverefund', title: 'Approve Refund', show: limit.UserReports.approvedRefund, },
                    { path: '/master/player/approveplayer', title: 'Approve Player', show: limit.UserReports.approvedPlayer, },
                    { path: '/reports/refund', title: 'Refund Report', show: limit.UserReports.refundReport, },
                    { path: '/reports/contestsummary', title: 'User Cash Report', show: limit.UserReports.UserCashReport, },
                    { path: '/reports/gamesummary', title: 'User Contest Report', show: limit.UserReports.UserContestReport, },
                    { path: '/reports/downloadsummary', title: 'Active User Report', show: limit.UserReports.ActiveUserReport, },
                    { path: '/reports/retention', title: 'User Retention', show: limit.UserReports.UserRetention, },
                    { path: '/reports/channelretention', title: 'Channel Retention', show: limit.UserReports.ChannelRetention, },
                    { path: '/reports/sourceretention', title: 'Source Retention', show: limit.UserReports.sourceRetention, }
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
                    { path: '/reports/acquisitiondetails', title: 'AcquisitionDetails', show: limit.AcquisitionReports.AcquisitionDetails, }
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