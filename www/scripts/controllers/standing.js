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

DashboardStandingCtrl.$inject = ['$rootScope', '$scope', '$state', 'standings'];

function DashboardStandingCtrl($rootScope, $scope, $state, standings) {
  console.log(standings);
}
