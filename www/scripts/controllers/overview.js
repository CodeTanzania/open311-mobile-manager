'use strict';

/**
 * @ngdoc function
 * @name dawasco.controller:DashboardOverviewCtrl
 * @description
 * # DashboardOverviewCtrl
 * Service Request controller of dawasco
 */
angular
    .module('dawasco')
    .controller('DashboardOverviewCtrl', function(
        $rootScope, $scope, $state, Summary, overviews
    ) {

        console.log(overviews);

        //initialize overview
        $scope.overviews = overviews;


        $scope.prepare = function() {
            //obtain issues summary
            $scope.issues = overviews.issues;

            $scope.prepareIssueByJurisdiction();

            $scope.prepareIssueByStatus();

            $scope.prepareIssueByPriority();

        };

        $scope.prepareIssueByJurisdiction = function() {

            var jurisdictions = _.map($scope.overviews.jurisdictions, 'jurisdiction');

            $scope.jurisdictionConfig = {
                radius: '55%',
                center: ['50%', '60%'],
                height: 300,
                tooltip: {
                    trigger: 'item',
                    formatter: '{a} <br/>{b} : {c} ({d}%)'
                },
                legend: {
                    orient: 'horizontal',
                    x: 'center',
                    y: 'top',
                    data: jurisdictions
                },
                calculable: true
            };

            $scope.jurisdictionData = [{
                datapoints: _.map($scope.overviews.jurisdictions, function(jurisdiction) {
                    return { x: jurisdiction.jurisdiction, y: jurisdiction.count };
                })
            }];

        };


        $scope.prepareIssueByStatus = function() {

            var statuses = _.map($scope.overviews.statuses, 'status');

            $scope.statusConfig = {
                radius: '55%',
                center: ['50%', '60%'],
                height: 300,
                tooltip: {
                    trigger: 'item',
                    formatter: '{a} <br/>{b} : {c} ({d}%)'
                },
                legend: {
                    orient: 'horizontal',
                    x: 'center',
                    y: 'top',
                    data: statuses
                },
                calculable: true
            };

            $scope.statusData = [{
                datapoints: _.map($scope.overviews.statuses, function(status) {
                    return { x: status.status, y: status.count };
                })
            }];

        };


        $scope.prepareIssueByPriority = function() {

            var priorities = _.map($scope.overviews.priorities, 'priority');

            $scope.priorityConfig = {
                radius: '55%',
                center: ['50%', '60%'],
                height: 300,
                tooltip: {
                    trigger: 'item',
                    formatter: '{a} <br/>{b} : {c} ({d}%)'
                },
                legend: {
                    orient: 'horizontal',
                    x: 'center',
                    y: 'top',
                    data: priorities
                },
                calculable: true
            };

            $scope.priorityData = [{
                datapoints: _.map($scope.overviews.priorities, function(
                    priority) {
                    return { x: priority.priority, y: priority.count };
                })
            }];

        };


        //listen for events and reload overview accordingly
        $scope.refresh = function() {
            Summary.overviews().then(function(overviews) {
                $scope.overviews = overviews;
                $scope.prepare();
                $scope.$broadcast('scroll.refreshComplete');
            });
        };

        //prepare overview details
        $scope.prepare();

    });
