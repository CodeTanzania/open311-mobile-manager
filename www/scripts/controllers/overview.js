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
  .controller('DashboardOverviewCtrl', DashboardOverviewCtrl);

DashboardOverviewCtrl.$inject = ['$q', '$rootScope', '$scope', '$state', '$ionicModal', '$ionicLoading', 'Summary', 'endpoints'];

function DashboardOverviewCtrl($q, $rootScope, $scope, $state, $ionicModal, $ionicLoading, Summary, endpoints) {

  //initialize scope attributes
  $scope.maxDate = new Date();

  //bind states
  $scope.priorities = endpoints.priorities.priorities;
  $scope.statuses = endpoints.statuses.statuses;
  $scope.services = endpoints.services.services;
  $scope.servicegroups = endpoints.servicegroups.servicegroups;
  $scope.jurisdictions = endpoints.jurisdictions.jurisdictions;
  // $scope.workspaces = party.settings.party.relation.workspaces;

  //bind filters
  var defaultFilters = {
    startedAt: moment().utc().startOf('date').toDate(),
    endedAt: moment().utc().endOf('date').toDate(),
    statuses: [],
    services: [],
    priorities: [],
    servicegroups: [],
    jurisdictions: [],
    workspaces: []
  };

  $scope.filters = defaultFilters;

  // initialize overviews
  $scope.overviews = [];
  $scope.issues = {};


  function init() {

    $scope.modalTitle = 'Overview Reports - Filters';

    $ionicModal.fromTemplateUrl('views/dashboards/_partials/filters.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function (modal) {
      $scope.modal = modal;
    });
  }

  // build chart option which add bottom margin
  function buildChartOptions(index, chunksSize) {

    var chartOptions = (index === (chunksSize - 1)) ? {} : {
      grid: {
        bottom: '30%'
      }
    };

    return chartOptions;
  }


  // Open filters modal Window
  $scope.openModal = function () {
    $scope.modal.show();
  }



  // Close Filter modal window
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


  $scope.prepare = function () {

    //notify no data loaded
    // if (!$scope.overviews || $scope.overviews.length <= 0) {
    //   $rootScope.$broadcast('appWarning', {
    //     message: 'No Data Found. Please Update Your Filters.'
    //   });
    // }

    //update export filename
    // $scope.exports.filename = 'overview_reports_' + Date.now() + '.csv';

    //prepare charts
    $scope.prepareIssuePerServiceGroup();
    $scope.prepareIssuePerService();
    $scope.prepareIssuePerStatus();
    $scope.prepareIssuePerPriority();

  };


  /**
   * prepare per service group bar chart
   * @return {object} echart bar chart configurations
   * @version 0.1.0
   * @since  0.1.0
   * @author lally elias<lallyelias87@gmail.com>
   */
  $scope.prepareIssuePerServiceGroup = function () {

    //prepare chart config
    $scope.perGroupConfig = {
      height: 400,
      forceClear: true
    };

    //prepare chart options
    $scope.perGroupOptions = [];

    //prepare unique service groups for bar chart categories
    var categories = _.chain($scope.overviews)
      .map('group')
      .uniqBy('name')
      .value();

    // split charts to fit mobile device widths
    var chunks = _.chunk(categories, 2);
    var chunksSize = _.size(chunks);

    _.forEach(chunks, function (serviceGroups, index) {

      var data = _.map(serviceGroups, function (serviceGroup) {
        var value = _.filter($scope.overviews, function (overview) {
          return overview.group.name == serviceGroup.name;
        })

        value = value ? _.sumBy(value, 'count') : 0;

        var serie = {
          name: serviceGroup.name,
          value: value,
          itemStyle: {
            normal: {
              color: serviceGroup.color
            }
          }
        };

        return serie;

      });

      // add bottom margin for top charts
      var chartOptions = buildChartOptions(index, chunksSize);

      // prepare charts options
      $scope.perGroupOptions.push(_.merge(chartOptions, {
        color: _.map(data, 'itemStyle.normal.color'),
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
   * prepare per status bar chart
   * @return {object} echart bar chart configurations
   * @version 0.1.0
   * @since  0.1.0
   * @author lally elias<lallyelias87@gmail.com>
   */
  $scope.prepareIssuePerStatus = function () {

    //prepare unique status for bar chart categories
    var categories = _.chain($scope.overviews)
      .map('status')
      .uniqBy('name')
      .value();

    //prepare chart config
    $scope.perStatusConfig = {
      height: 400,
      forceClear: true
    };

    // prepare charts options
    $scope.perStatusOptions = [];

    var chunks = _.chunk(categories, 3);
    var chunksSize = _.size(chunks);

    _.forEach(chunks, function (statuses, index) {

      var data = _.map(statuses, function (status) {

        var value = _.filter($scope.overviews, function (overview) {
          return overview.status.name === status.name;
        })

        value = value ? _.sumBy(value, 'count') : 0;

        var serie = {
          name: status.name,
          value: value,
          itemStyle: {
            normal: {
              color: status.color
            }
          }
        };

        return serie;
      });

      var chartOptions = buildChartOptions(index, chunksSize);

      $scope.perStatusOptions.push(_.merge(chartOptions, {
        color: _.map(data, 'itemStyle.normal.color'),
        textStyle: {
          fontFamily: 'Lato'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b} : {c}'
        },
        // toolbox: {
        //   show: true,
        //   feature: {
        //     saveAsImage: {
        //       name: 'Issue per Status-' + new Date().getTime(),
        //       title: 'Save',
        //       show: true
        //     }
        //   }
        // },
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
   * prepare per priority bar chart
   * @return {object} echart bar chart configurations
   * @version 0.1.0
   * @since  0.1.0
   * @author lally elias<lallyelias87@gmail.com>
   */
  $scope.prepareIssuePerPriority = function () {

    //prepare chart config
    $scope.perPriorityConfig = {
      height: 400,
      forceClear: true
    };

    // prepare chart options
    $scope.perPriorityOptions = [];

    //prepare unique priority for bar chart categories
    var categories = _.chain($scope.overviews)
      .map('priority')
      .uniqBy('name')
      .value();

    // split charts for better visibility
    var chunks = _.chunk(categories, 3);
    var chunksSize = _.size(chunks);

    _.forEach(chunks, function (priorities, index) {

      var data = _.map(priorities, function (priority) {

        var value = _.filter($scope.overviews, function (overview) {
          return overview.priority.name === priority.name;
        });

        value = value ? _.sumBy(value, 'count') : 0;

        var serie = {
          name: priority.name,
          value: value,
          itemStyle: {
            normal: {
              color: priority.color
            }
          }
        };

        return serie;

      });


      // add bottom margin for top charts
      var chartOptions = buildChartOptions(index, chunksSize);

      // prepare charts options
      $scope.perPriorityOptions.push(_.merge(chartOptions, {
        color: _.map(data, 'itemStyle.normal.color'),
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
   * prepare per service bar chart
   * @return {object} echart bar chart configurations
   * @version 0.1.0
   * @since  0.1.0
   * @author lally elias<lallyelias87@gmail.com>
   */
  $scope.prepareIssuePerService = function () {

    //prepare unique services for bar chart categories
    var categories = _.chain($scope.overviews)
      .map('service')
      .uniqBy('name')
      .value();


    //prepare chart config
    $scope.perPerServiceConfig = {
      height: 400,
      forceClear: true
    };

    //prepare chart options
    $scope.perPerServiceOptions = [];

    //chunk services for better charting display
    var chunks = _.chunk(categories, 2);
    var chunksSize = _.size(chunks);
    _.forEach(chunks, function (services, index) {

      //prepare bar chart serie data
      var data =
        _.map(services, function (category) {

          //obtain all overviews of specified service name
          var value =
            _.filter($scope.overviews, function (overview) {
              return overview.service.name === category.name;
            });
          value = value ? _.sumBy(value, 'count') : 0;

          var serie = {
            name: category.name,
            value: value,
            itemStyle: {
              normal: {
                color: category.color
              }
            }
          };

          return serie;

        });

      //ensure bottom margin for top charts
      var chartOptions = buildChartOptions(index, chunksSize);

      //prepare chart options
      $scope.perPerServiceOptions.push(_.merge(chartOptions, {
        color: _.map(data, 'itemStyle.normal.color'),
        textStyle: {
          fontFamily: 'Lato'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b} : {c}'
        },
        // toolbox: {
        //   show: true,
        //   feature: {
        //     saveAsImage: {
        //       name: 'Issue Per Service-' + new Date().getTime(),
        //       title: 'Save',
        //       show: true
        //     }
        //   }
        // },
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
   * Reload overview reports
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

    $q.all([Summary.overviews({
      query: $scope.params
    })]).then(function (values) {

      $scope.overviews = values[0];
      // $scope.issues = values[0].issues;

      $scope.prepare();

      $ionicLoading.hide();

    }).catch(function (error) {
      $ionicLoading.hide();
    });
  };


  //listen for refresh event and reload overview accordingly
  $scope.refresh = function () {

    $q.all([Summary.overviews({
      query: $scope.params
    })]).then(function (values) {

      $scope.overviews = values[0];
      // $scope.issues = values[1].issues;

      $scope.prepare();
      $scope.$broadcast('scroll.refreshComplete');
    });
  };

  init();

  //pre-load reports
  $scope.reload();

  $rootScope.$on('overviews:reload', function () {
    $scope.reload();
  });

  $scope.$on('$destroy', function () {
    if ($scope.modal) {
      $scope.modal.remove();
    }
  });

}
