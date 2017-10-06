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

DashboardOverviewCtrl.$inject = ['$rootScope', '$scope', '$state', '$ionicModal', 'Summary', 'endpoints'];

function DashboardOverviewCtrl($rootScope, $scope, $state, $ionicModal, Summary, endpoints) {

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


  function init() {

    $scope.modalTitle = 'Overview Reports - Filters';

    $ionicModal.fromTemplateUrl('views/dashboards/_partials/filters.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function (modal) {
      $scope.modal = modal;
    });
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


    //prepare unique service groups for bar chart categories
    var categories = _.chain($scope.overviews)
      .map('group')
      .uniqBy('name')
      .value();

    //prepare bar chart series data
    var data =
      _.map(categories, function (category) {
        //obtain all overviews of specified group(category)
        var value =
          _.filter($scope.overviews, function (overview) {
            return overview.group.name === category.name;
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

    //prepare chart config
    $scope.perGroupConfig = {
      height: 400,
      forceClear: true
    };

    //prepare chart options
    $scope.perGroupOptions = {
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
      //       name: 'Issue per Service Group-' + new Date().getTime(),
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
    };

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

    //prepare bar chart series data
    var data =
      _.map(categories, function (category) {

        //obtain all overviews of specified status(category)
        var value =
          _.filter($scope.overviews, function (overview) {
            return overview.status.name === category.name;
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

    //prepare chart config
    $scope.perStatusConfig = {
      height: 400,
      forceClear: true
    };

    //prepare chart options
    $scope.perStatusOptions = {
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
    };

  };


  /**
   * prepare per priority bar chart
   * @return {object} echart bar chart configurations
   * @version 0.1.0
   * @since  0.1.0
   * @author lally elias<lallyelias87@gmail.com>
   */
  $scope.prepareIssuePerPriority = function () {

    //prepare unique priority for bar chart categories
    var categories = _.chain($scope.overviews)
      .map('priority')
      .uniqBy('name')
      .value();


    //prepare bar chart series data
    var data =
      _.map(categories, function (category) {

        //obtain all overviews of specified priority(category)
        var value =
          _.filter($scope.overviews, function (overview) {
            return overview.priority.name === category.name;
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

    //prepare chart config
    $scope.perPriorityConfig = {
      height: 400,
      forceClear: true
    };

    //prepare chart options
    $scope.perPriorityOptions = {
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
      //       name: 'Issue per Priority-' + new Date().getTime(),
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
    };

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
    var chunks = _.chunk(categories, 6);
    var chunksSize = _.size(chunks);
    _.forEach(chunks, function (services, index) {

      //prepare bar chart serie data
      var data =
        _.map(services, function (category) {

          //obtain all overviews of specified priority(category)
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
      var chart = (index === (chunksSize - 1)) ? {} : {
        grid: {
          bottom: '30%'
        }
      };

      //prepare chart options
      $scope.perPerServiceOptions.push(_.merge(chart, {
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

    Summary
      .reports({
        query: $scope.params
      })
      .then(function (reports) {
        $scope.issues = reports.issues;
      });

    Summary
      .overviews({
        query: $scope.params
      })
      .then(function (overviews) {
        $scope.overviews = overviews;
        $scope.prepare();
      });

  };


  //listen for refresh event and reload overview accordingly
  $scope.refresh = function () {

    Promise.all([Summary.overviews({
      query: $scope.params
    }), Summary.reports({
      query: $scope.params
    })]).then(function (values) {

      $scope.overviews = values[0];
      $scope.issues = values[1].issues;

      $scope.prepare();
      $scope.$broadcast('scroll.refreshComplete');
    })
  };

  //pre-load reports
  //prepare overview details
  $scope.params = Summary.prepareQuery($scope.filters);
  $scope.reload();

  init();
}
