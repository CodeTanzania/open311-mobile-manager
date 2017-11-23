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

AppController.$inject = ['$rootScope', '$cordovaToast', '$cordovaNetwork', '$ionicLoading'];

function AppController($rootScope, $cordovaToast, $cordovaNetwork, $ionicLoading) {

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


  if (!$cordovaNetwork.isOnline()) {
    $cordovaToast.
    showLongBottom('You are Currently Offline')
      .then(function (success) {

      }, function (error) {

      });
  }

  $rootScope.$on('signinError', function (response) {
    // show toast when login credentials are invalid
    $cordovaToast
      .showLongBottom('Invalid Email or Password, Please Try Again')
      .then(function (success) {
        $ionicLoading.hide();
      }, function (error) {

      });
    // console.log(response);
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
