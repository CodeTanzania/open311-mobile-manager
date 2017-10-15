'use strict';

/**
 * @ngdoc
 * @name dawasco.controller:AppController
 * @description
 * # Application Controller
 * Handle application events
 */

angular
  .module('dawasco')
  .controller('AppController', AppController);

AppController.$inject = ['$rootScope', '$ionicLoading'];

function AppController($rootScope, $ionicLoading) {

  $rootScope.$on('signinBegin', function () {
    $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      hideOnStateChange: true,
      maxWidth: 200,
      showDelay: 0
    });
  });

  // $rootScope.$on('$stateChangeStart', function () {
  //   $ionicLoading.show({
  //     content: 'Loading',
  //     animation: 'fade-in',
  //     showBackdrop: true,
  //     maxWidth: 200,
  //     showDelay: 0
  //   });
  // });

  // $rootScope.$on('$stateChangeSuccess', function () {
  //   $ionicLoading.hide();
  // });
}
