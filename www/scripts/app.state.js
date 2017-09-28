'use strict';

/**
 *@description Application States
 */

angular
  .module('dawasco')
  .config(function ($stateProvider, $urlRouterProvider,
    $ionicConfigProvider) {

    //center view title always
    $ionicConfigProvider.navBar.alignTitle('center');

    //disable previous title to be used in back button
    $ionicConfigProvider.backButton.previousTitleText(false);

    //remove back button text
    $ionicConfigProvider.backButton.text('');

    //position tabs on the top
    $ionicConfigProvider.tabs.position('bottom');

    //use standard tabs style
    $ionicConfigProvider.tabs.style('standard');

    //enable js scrolling
    $ionicConfigProvider.scrolling.jsScrolling(true);



    //base application state
    $stateProvider
      .state('app', {
        abstract: true,
        templateUrl: 'views/layouts/app.html'
      })
      //Authentication states
      .state('app.login', {
        url: '/signin',
        templateUrl: 'views/authentication/signin.html'
      })
      .state('app.forgot', {
        templateUrl: 'views/authentication/forgot.html'
      })

      // Dashboard states
      .state('app.dashboard', {
        abstract: true,
        templateUrl: 'views/layouts/tabs.html'
      })
      .state('app.dashboard.overviews', {
        url: '/overviews',
        views: {
          'overviews': {
            templateUrl: 'views/dashboards/overviews.html',
            controller: 'DashboardOverviewCtrl',
          }
        },
        resolve: {
          overviews: function (Summary) {
            return Summary.overviews();
          }
        }
      })
      .state('app.dashboard.performances', {
        url: '/performance',
        views: {
          'performances': {
            templateUrl: 'views/dashboards/performance.html',
          }
        }
      })
      .state('app.dashboard.productivity', {
        url: '/productivity',
        views: {
          'productivity': {
            templateUrl: 'views/dashboards/productivity.html'
          }
        }
      });

    //provide fallback state
    $urlRouterProvider.otherwise('/signin');

  });
