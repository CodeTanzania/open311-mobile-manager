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

  $scope.visualizationPieConfig = {
    height: 300,
    forceClear: true
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

  $scope.prepareOverviewVisualization();
  $scope.preparePipelineVisualization();

  console.log($scope.overviewOptions);
}
