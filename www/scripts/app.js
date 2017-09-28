'use strict';

angular
    .module('dawasco', [
        'ionic',
        'angular-echarts'
    ])
    .run(function($ionicPlatform /*, $cordovaSplashscreen , $cordovaStatusbar*/ ) {

        $ionicPlatform.ready(function() {

            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);

            }

            //set status bar colors
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                // $cordovaStatusbar.styleHex('#fff');
                // $cordovaStatusbar.hide();
                // StatusBar.styleDefault();
            }

            //hide splashscreen
            // $cordovaSplashscreen.hide();

        });

    })
    .config(function($stateProvider, $urlRouterProvider,
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
                templateUrl: 'views/layouts/tabs.html'
            })
            .state('app.overviews', {
                url: '/overviews',
                views: {
                    'overviews': {
                        templateUrl: 'views/dashboards/overviews.html',
                        controller: 'DashboardOverviewCtrl',
                    }
                },
                resolve: {
                    overviews: function(Summary) {
                        return Summary.overviews();
                    }
                }
            });

        //provide fallback state
        $urlRouterProvider.otherwise('/overviews');

    });
