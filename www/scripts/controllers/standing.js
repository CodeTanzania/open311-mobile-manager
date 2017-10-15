'use strict';


/**
 * @ngdoc function
 * @name dawasco.controller:DashboardStandingCtrl
 * @description
 * # DashboardStandingCtrl
 * dashboard daily standing controller of dawasco
 */
angular
  .module('dawasco')
  .controller('DashboardStandingCtrl', DashboardStandingCtrl);

DashboardStandingCtrl.$inject = ['$rootScope', '$scope', '$state', '$ionicModal', '$ionicLoading',
  'Summary', 'endpoints'
];

function DashboardStandingCtrl($rootScope, $scope, $state, $ionicModal, $ionicLoading, Summary, endpoints) {

  $scope.priorities = endpoints.priorities.priorities;
  $scope.statuses = endpoints.statuses.statuses;
  $scope.services = endpoints.services.services;
  $scope.servicegroups = endpoints.servicegroups.servicegroups;
  $scope.jurisdictions = endpoints.jurisdictions.jurisdictions;
  // $scope.workspaces = party.settings.party.relation.workspaces;

  var defaultFilters = {
    startedAt: moment().utc().startOf('date').toDate(),
    endedAt: moment().utc().endOf('date').toDate(),
    statuses: [],
    priorities: [],
    services: [],
    servicegroups: [],
    jurisdictions: [],
    workspaces: []
  };

  $scope.filters = defaultFilters;

  //initialize standings
  $scope.standings = [];

  // initialize scope attributes
  $scope.maxDate = new Date();

  function init() {

    $scope.modalTitle = 'Standing Reports - Filters';

    $ionicModal.fromTemplateUrl('views/dashboards/_partials/filters.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function (modal) {
      $scope.modal = modal;
    });
  }


  // build chart option to add bottom margin
  function buildChartOptions(index, chunksSize) {

    var chartOptions = (index === (chunksSize - 1)) ? {} : {
      grid: {
        bottom: '30%'
      }
    };

    return chartOptions;
  }

  /**
   * Open filters modal Window
   */
  $scope.openModal = function () {
    $scope.modal.show();
  }


  /**
   * Close Filter modal window
   */
  $scope.closeModal = function () {
    $scope.modal.hide();
  }


  /**
   * Filter overview reports based on on current selected filters
   * @param {Boolean} [reset] whether to clear and reset filter
   */
  $scope.filter = function (reset) {
    if (reset) {
      $scope.filters = defaultFilters;
    }
    //prepare query
    $scope.params = Summary.prepareQuery($scope.filters);

    //load reports
    $scope.reload();

    //close current modal
    $scope.closeModal();
  };


  /**
   * Filter service based on selected service group
   */
  $scope.filterServices = function () {
    var filterHasServiceGroups =
      ($scope.filters.servicegroups && $scope.filters.servicegroups.length >
        0);
    //pick only service of selected group
    if (filterHasServiceGroups) {
      //filter services based on service group(s)
      $scope.services =
        _.filter(endpoints.services.services, function (service) {
          return _.includes($scope.filters.servicegroups, service.group
            ._id);
        });
    }
    //use all services
    else {
      $scope.services = endpoints.services.services;
    }
  };


  /**
   * Prepare standing reports for display
   */
  $scope.prepare = function () {

    //notify no data loaded
    // if (!$scope.standings || $scope.standings.length <= 0) {
    //   $rootScope.$broadcast('appWarning', {
    //     message: 'No Data Found. Please Update Your Filters.'
    //   });
    // }

    // //update export filename
    // $scope.exports.filename = 'standing_reports_' + Date.now() + '.csv';

    //build reports
    $scope.prepareIssuePerJurisdiction();
    $scope.prepareIssuePerJurisdictionPerServiceGroup();
    $scope.prepareIssuePerJurisdictionPerService();
    $scope.prepareIssuePerJurisdictionPerPriority();
    $scope.prepareIssuePerJurisdictionPerStatus();

  };


  /**
   * prepare per jurisdiction
   * @return {object} echart bar chart configurations
   * @version 0.1.0
   * @since  0.1.0
   * @author lally elias<lallyelias87@gmail.com>
   */
  $scope.prepareIssuePerJurisdiction = function () {

    //prepare unique jurisdictions for bar chart categories
    var categories = _.chain($scope.standings)
      .map('jurisdiction')
      .uniqBy('name')
      .value();

    //prepare chart config
    $scope.perJurisdictionConfig = {
      height: 400,
      forceClear: true
    };

    // prepare charts options
    $scope.perJurisdictionOptions = [];

    var chunks = _.chunk(categories, 2);
    var chunksSize = _.size(chunks);

    _.forEach(chunks, function (jurisdictions, index) {

      //prepare unique jurisdiction color for bar chart and legends color
      var colors = _.map(jurisdictions, 'color');

      //prepare unique jurisdiction name for bar chart legends label
      var legends = _.map(jurisdictions, 'name');

      //prepare bar chart series data
      var data = _.map(jurisdictions, function (jurisdiction) {

        var value = _.filter($scope.standings, function (standing) {
          return standing.jurisdiction.name === jurisdiction.name;
        });

        value = value ? _.sumBy(value, 'count') : 0;

        var serie = {
          name: jurisdiction.name,
          value: value,
          itemStyle: {
            normal: {
              color: jurisdiction.color
            }
          }
        };

        return serie;

      });

      var chartOptions = buildChartOptions(index, chunksSize);

      $scope.perJurisdictionOptions.push(_.merge(chartOptions, {
        color: colors,
        textStyle: {
          fontFamily: 'Lato'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b} : {c}'
        },
        calculable: true,
        xAxis: [{
          type: 'category',
          data: _.map(data, 'name'),
          axisTick: {
            alignWithLabel: true
          }
        }],
        yAxis: [{
          type: 'value'
        }],
        series: [{
          type: 'bar',
          barWidth: '70%',
          label: {
            normal: {
              show: true
            }
          },
          markPoint: { // show area with maximum and minimum
            data: [{
                name: 'Maximum',
                type: 'max'
              },
              {
                name: 'Minimum',
                type: 'min'
              }
            ]
          },
          markLine: { //add average line
            precision: 0,
            data: [{
              type: 'average',
              name: 'Average'
            }]
          },
          data: data
        }]
      }));

    });

  };


  /**
   * prepare per jurisdiction per service group bar chart
   * @return {object} echart bar chart configurations
   * @version 0.1.0
   * @since  0.1.0
   * @author lally elias<lallyelias87@gmail.com>
   */
  $scope.prepareIssuePerJurisdictionPerServiceGroup = function () {

    //prepare unique jurisdictions for bar chart categories
    var categories = _.chain($scope.standings)
      .map('jurisdiction.name')
      .uniq()
      .value();

    //prepare unique group for bar chart series
    var groups = _.chain($scope.standings)
      .map('group')
      .uniqBy('name')
      .value();

    //prepare unique group color for bar chart and legends color
    var colors = _.map(groups, 'color');

    //prepare unique group name for bar chart legends label
    var legends = _.map(groups, 'name');

    // create chunks for splitting charts for better visibility
    var chunks = _.chunk(categories, 1);
    var chunksSize = _.size(chunks);

    //prepare chart config
    $scope.perJurisdictionPerServiceGroupConfig = {
      height: 400,
      forceClear: true
    };

    // prepare charts options
    $scope.perJurisdictionPerServiceGroupOptions = [];

    //prepare bar chart series


    _.forEach(chunks, function (jurisdictions, index) {

      var series = {};

      _.forEach(jurisdictions, function (jurisdiction) {
        _.forEach(groups, function (group) {
          var serie = series[group.name] || {
            name: group.name,
            type: 'bar',
            label: {
              normal: {
                show: true,
                position: 'top'
              }
            },
            data: []
          };

          //obtain all standings of specified jurisdiction(category) and group
          var value = _.filter($scope.standings, function (standing) {
            return (standing.jurisdiction.name === jurisdiction &&
              standing.group.name === group.name);
          });

          value = value ? _.sumBy(value, 'count') : 0;

          serie.data.push({
            value: value,
            itemStyle: {
              normal: {
                color: group.color
              }
            }
          });


          series[group.name] = serie;
        });
      });

      series = _.values(series);

      var chartOptions = buildChartOptions(index, chunksSize);

      $scope.perJurisdictionPerServiceGroupOptions.push(_.merge(chartOptions, {
        color: colors,
        textStyle: {
          fontFamily: 'Lato'
        },
        tooltip: {
          trigger: 'item',
          // formatter: '{b} : {c}'
        },
        legend: {
          orient: 'horizontal',
          x: 'center',
          y: 'top',
          data: legends
        },
        calculable: true,
        xAxis: [{
          type: 'category',
          data: jurisdictions
        }],
        yAxis: [{
          type: 'value'
        }],
        series: series
      }));

    });

  };


  /**
   * prepare per jurisdiction per service bar chart
   * @return {object} echart bar chart configurations
   * @version 0.1.0
   * @since  0.1.0
   * @author lally elias<lallyelias87@gmail.com>
   */
  $scope.prepareIssuePerJurisdictionPerService = function () {

    //prepare unique jurisdictions for bar chart categories
    var categories = _.chain($scope.standings)
      .map('jurisdiction.name')
      .uniq()
      .value();

    //prepare unique service for bar chart series
    var services = _.chain($scope.standings)
      .map('service')
      .uniqBy('name')
      .value();

    //prepare chart config
    $scope.perJurisdictionPerServiceConfig = {
      height: 400,
      forceClear: true
    };
    //prepare chart options
    $scope.perJurisdictionPerServiceOptions = [];

    //chunk services for better charting display
    var chunks = _.chunk(services, 4);
    var chunksSize = _.size(chunks);
    _.forEach(chunks, function (_services, index) {

      //prepare unique service color for bar chart and legends color
      var colors = _.map(_services, 'color');

      //prepare unique service name for bar chart legends label
      var legends = _.map(_services, 'name');

      //prepare bar chart series
      var series = {};
      _.forEach(categories, function (category) {
        _.forEach(_services, function (service) {
          var serie = series[service.name] || {
            name: service.name,
            type: 'bar',
            label: {
              normal: {
                show: true,
                position: 'top'
              }
            },
            data: []
          };

          //obtain all standings of specified jurisdiction(category)
          //and service
          var value =
            _.filter($scope.standings, function (standing) {
              return (standing.jurisdiction.name ===
                category &&
                standing.service.name === service.name);
            });
          value = value ? _.sumBy(value, 'count') : 0;
          serie.data.push({
            value: value,
            itemStyle: {
              normal: {
                color: service.color
              }
            }
          });
          series[service.name] = serie;
        });
      });
      series = _.values(series);

      //ensure bottom margin for top charts
      var chart = (index === (chunksSize - 1)) ? {} : {
        grid: {
          bottom: '30%'
        }
      };

      //prepare chart options
      $scope.perJurisdictionPerServiceOptions.push(_.merge(chart, {
        color: colors,
        textStyle: {
          fontFamily: 'Lato'
        },
        tooltip: {
          trigger: 'item',
          // formatter: '{b} : {c}'
        },
        legend: {
          orient: 'horizontal',
          x: 'center',
          y: 'top',
          data: legends
        },
        calculable: true,
        xAxis: [{
          type: 'category',
          data: categories
        }],
        yAxis: [{
          type: 'value'
        }],
        series: series
      }));

    });

  };


  /**
   * prepare per jurisdiction per status bar chart
   * @return {object} echart bar chart configurations
   * @version 0.1.0
   * @since  0.1.0
   * @author lally elias<lallyelias87@gmail.com>
   */
  $scope.prepareIssuePerJurisdictionPerStatus = function () {

    //prepare unique jurisdictions for bar chart categories
    var categories = _.chain($scope.standings)
      .map('jurisdiction.name')
      .uniq()
      .value();

    //prepare unique status for bar chart series
    var statuses = _.chain($scope.standings)
      .map('status')
      .uniqBy('name')
      .value();

    //prepare unique status color for bar chart and legends color
    var colors = _.map(statuses, 'color');

    //prepare unique status name for bar chart legends label
    var legends = _.map(statuses, 'name');

    //prepare bar chart series
    var series = {};
    _.forEach(categories, function (category) {
      _.forEach(statuses, function (status) {
        var serie = series[status.name] || {
          name: status.name,
          type: 'bar',
          label: {
            normal: {
              show: true,
              position: 'top'
            }
          },
          data: []
        };

        //obtain all standings of specified jurisdiction(category)
        //and status
        var value =
          _.filter($scope.standings, function (standing) {
            return (standing.jurisdiction.name ===
              category &&
              standing.status.name === status.name);
          });
        value = value ? _.sumBy(value, 'count') : 0;
        serie.data.push({
          value: value,
          itemStyle: {
            normal: {
              color: status.color
            }
          }
        });
        series[status.name] = serie;
      });
    });
    series = _.values(series);

    //prepare chart config
    $scope.perJurisdictionPerStatusConfig = {
      height: 400,
      forceClear: true
    };

    //prepare chart options
    $scope.perJurisdictionPerStatusOptions = {
      color: colors,
      textStyle: {
        fontFamily: 'Lato'
      },
      tooltip: {
        trigger: 'item',
        // formatter: '{b} : {c}'
      },
      legend: {
        orient: 'horizontal',
        x: 'center',
        y: 'top',
        data: legends
      },
      calculable: true,
      xAxis: [{
        type: 'category',
        data: categories
      }],
      yAxis: [{
        type: 'value'
      }],
      series: series
    };

  };


  /**
   * prepare per jurisdiction per priority bar chart
   * @return {object} echart bar chart configurations
   * @version 0.1.0
   * @since  0.1.0
   * @author lally elias<lallyelias87@gmail.com>
   */
  $scope.prepareIssuePerJurisdictionPerPriority = function () {

    //prepare unique jurisdictions for bar chart categories
    var categories = _.chain($scope.standings)
      .map('jurisdiction.name')
      .uniq()
      .value();

    //prepare unique priority for bar chart series
    var priorities = _.chain($scope.standings)
      .map('priority')
      .uniqBy('name')
      .value();

    //prepare unique priority color for bar chart and legends color
    var colors = _.map(priorities, 'color');

    //prepare unique priority name for bar chart legends label
    var legends = _.map(priorities, 'name');

    //prepare bar chart series
    var series = {};
    _.forEach(categories, function (category) {
      _.forEach(priorities, function (priority) {
        var serie = series[priority.name] || {
          name: priority.name,
          type: 'bar',
          label: {
            normal: {
              show: true,
              position: 'top'
            }
          },
          data: []
        };

        //obtain all standings of specified jurisdiction(category)
        //and priority
        var value =
          _.filter($scope.standings, function (standing) {
            return (standing.jurisdiction.name ===
              category &&
              standing.priority.name === priority.name);
          });
        value = value ? _.sumBy(value, 'count') : 0;
        serie.data.push({
          value: value,
          itemStyle: {
            normal: {
              color: priority.color
            }
          }
        });
        series[priority.name] = serie;
      });
    });
    series = _.values(series);

    //prepare chart config
    $scope.perJurisdictionPerPriorityConfig = {
      height: 400,
      forceClear: true
    };

    //prepare chart options
    $scope.perJurisdictionPerPriorityOptions = {
      color: colors,
      textStyle: {
        fontFamily: 'Lato'
      },
      tooltip: {
        trigger: 'item',
        // formatter: '{b} : {c}'
      },
      legend: {
        orient: 'horizontal',
        x: 'center',
        y: 'top',
        data: legends
      },
      calculable: true,
      xAxis: [{
        type: 'category',
        data: categories
      }],
      yAxis: [{
        type: 'value'
      }],
      series: series
    };

  };


  /**
   * Reload standing reports
   */
  $scope.reload = function () {

    $scope.params = Summary.prepareQuery($scope.filters);

    $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
    });

    Summary
      .standings({
        query: $scope.params
      })
      .then(function (standings) {
        $scope.standings = standings;
        $scope.prepare();
        $ionicLoading.hide();
      }).catch(function (error) {
        console.log('Error: ', error);
        $ionicLoading.hide();
      });
  };

  //listen to refresh event and update content accordingly
  $scope.refresh = function () {
    Summary
      .standings({
        query: $scope.params
      })
      .then(function (standings) {
        $scope.standings = standings;
        $scope.prepare();
        $scope.$broadcast('scroll.refreshComplete');
      });
  }

  //pre-load reports
  //prepare overview details
  $scope.reload();

  init();

  $rootScope.$on('standings:reload', function () {
    $scope.reload();
  });

  $scope.$on('$destroy', function () {
    if ($scope.modal) {
      $scope.modal.remove();
    }
  });

}
