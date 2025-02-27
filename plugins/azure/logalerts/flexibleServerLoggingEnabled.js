var async = require('async');
var helpers = require('../../../helpers/azure');

module.exports = {
    title: 'PostgreSQL Flexible Server Logging Enabled',
    category: 'Log Alerts',
    domain: 'Management and Governance',
    severity: 'Medium',
    description: 'Ensures Activity Log alerts for create/update and delete PostgreSQL Flexible Server events are enabled.',
    more_info: 'Monitoring for create/update and delete PostgreSQL Flexible Server events gives insight into network access changes and may reduce the time it takes to detect suspicious activity.',
    recommended_action: 'Add a new log alert to the Alerts service that monitors for PostgreSQL Flexible Server create/update and delete events.',
    link: 'https://learn.microsoft.com/en-us/azure/azure-monitor/platform/activity-log-alerts',
    apis: ['activityLogAlerts:listBySubscriptionId'],
    realtime_triggers: ['microsoftinsights:activitylogalerts:write', 'microsoftinsights:activitylogalerts:delete'],

    run: function(cache, settings, callback) {
        var results = [];
        var source = {};
        var locations = helpers.locations(settings.govcloud);

        async.each(locations.activityLogAlerts, function(location, rcb) {
            var conditionResource = 'microsoft.dbforpostgresql/flexibleservers';
            var text = 'PostgreSql Flexible Server';
            var activityLogAlerts = helpers.addSource(cache, source,
                ['activityLogAlerts', 'listBySubscriptionId', location]);

            helpers.checkLogAlerts(activityLogAlerts, conditionResource, text, results, location);

            rcb();
        }, function() {
            callback(null, results, source);
        });
    }
};
