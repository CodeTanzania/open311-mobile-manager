'use strict';

/**
 * @ngdoc function
 * @name dawasco.controller:DashboardPerformanceCtrl
 * @description
 * # DashboardPerformanceCtrl
 * Service Request controller of dawasco
 */
angular
  .module('dawasco')
  .controller('DashboardPerformanceCtrl', DashboardPerformanceCtrl);


DashboardPerformanceCtrl.$inject = ['$rootScope', '$scope', '$ionicModal', 'endpoints', 'party'];

function DashboardPerformanceCtrl($rootScope, $scope, $ionicModal, endpoints, party) {

  // initialize scope attributes
  $scope.maxDate = new Date();


  //bind states
  $scope.priorities = endpoints.priorities.priorities;
  $scope.statuses = endpoints.statuses.statuses;
  $scope.services = endpoints.services.services;
  $scope.servicegroups = endpoints.servicegroups.servicegroups;
  $scope.jurisdictions = endpoints.jurisdictions.jurisdictions;

  $scope.party = party;

  $scope.jurisdiction = _.first($scope.jurisdictions);


  //bind filters
  var defaultFilters = {
    // startedAt: moment().utc().startOf('date').toDate(),
    startedAt: moment().utc().startOf('year').toDate(),
    endedAt: moment().utc().endOf('date').toDate(),
    jurisdictions: [].concat($scope.jurisdiction._id)
  };


  $scope.visualizationPieConfig = {
    height: 300,
    forceClear: true
  };

  function init() {

    $scope.modalTitle = 'Performance Reports - Filters';

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
  };


  // Close Filter modal window
  $scope.closeModal = function () {
    $scope.modal.hide();
  };

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
   * @name prepare
   * @description Prepare All performances charts
   * @type {function}
   * @version 0.1.0
   * @since 0.1.0
   * @author Benson Maruchu<benmaruchu@gmail.com>
   */
  $scope.prepare = function () {
    $scope.prepareOverviewVisualization();
    $scope.preparePipelineVisualization();
  };


  /**
   * prepare overview visualization per jurisdiction
   * @return {object} echart pie options configurations
   * @version 0.1.0
   * @since 0.1.0
   * @author Benson Maruchu<benmaruchu@gmail.com>
   */
  $scope.prepareOverviewVisualization = function () {


    var data = [{
      name: 'Pending',
      value: 100
    }, {
      name: 'Resolved',
      value: 2000
    }];

    $scope.overviewOptions = {
      textStyle: {
        fontFamily: 'Lato'
      },
      title: {
        text: 'Total',
        subtext: 3000,
        x: 'center',
        y: 'center',
        textStyle: {
          fontWeight: 'normal',
          fontSize: 16
        }
      },
      // tooltip: {
      //   show: true,
      //   trigger: 'item',
      //   formatter: "{b}:<br/> Count: {c} <br/> Percent: ({d}%)"
      // },
      series: [{
        type: 'pie',
        selectedMode: 'single',
        radius: ['30%', '40%'],
        color: [
          '#00acee',
          '#52cdd5',
          '#79d9f1',
          '#a7e7ff',
          '#c8efff'
        ],
        label: {
          normal: {
            formatter: '{b}\n{d}%\n ( {c} )'
          }
        },
        data: data
      }]
    };
  };


  $scope.preparePipelineVisualization = function () {


    var data = [{
      name: 'Open',
      value: 100
    }, {
      name: 'Escallated',
      value: 2000
    }, {
      name: 'In Progress',
      value: 500
    }, {
      name: 'Closed',
      value: 127
    }];

    $scope.pipelineOptions = {
      textStyle: {
        fontFamily: 'Lato'
      },
      title: {
        text: 'Total',
        subtext: 2727,
        x: 'center',
        y: 'center',
        textStyle: {
          fontWeight: 'normal',
          fontSize: 16
        }
      },
      // tooltip: {
      //   show: true,
      //   trigger: 'item',
      //   formatter: "{b}:<br/> Count: {c} <br/> Percent: ({d}%)"
      // },
      series: [{
        type: 'pie',
        selectedMode: 'single',
        radius: ['30%', '40%'],
        color: [
          '#00acee',
          '#52cdd5',
          '#79d9f1',
          '#a7e7ff',
          '#c8efff'
        ],
        label: {
          normal: {
            formatter: '{b}\n{d}%\n ( {c} )'
          }
        },
        data: data
      }]
    };
  };


  $scope.reload = function () {
    //TODO load data from the server
    $scope.prepare();
  };


  $scope.refresh = function () {
    // TODO load data from the server
    $scope.prepare();
    $scope.$broadcast('scroll.refreshComplete');
  };

  init();

  $scope.reload();

  $rootScope.$on('performances:reload', function () {
    $scope.reload();
  });

  $scope.$on('$destroy', function () {
    if ($scope.modal) {
      $scope.modal.remove();
    }
  });
}
