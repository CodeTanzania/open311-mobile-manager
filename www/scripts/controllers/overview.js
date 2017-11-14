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
    startedAt: moment().utc().startOf('year').toDate(),
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
  $scope.overviews = {};
  // $scope.issues = {};


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
    //prepare charts

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

    Summary
      .overviews({
        query: $scope.params
      })
      .then(function (overviews) {
        $scope.overviews = overviews;
        $scope.prepare();
        $ionicLoading.hide();

        console.log(overviews);

      }).catch(function (error) {
        $ionicLoading.hide();
      });


  };


  //listen for refresh event and reload overview accordingly
  $scope.refresh = function () {

    Summary
      .overviews({
        query: $scope.params
      })
      .then(function (overviews) {
        $scope.overviews = overviews;
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
