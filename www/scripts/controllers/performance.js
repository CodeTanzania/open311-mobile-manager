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


DashboardPerformanceCtrl.$inject = ['$scope', 'party'];

function DashboardPerformanceCtrl($scope, party) {

  $scope.party = party;
  console.log(party);
}
