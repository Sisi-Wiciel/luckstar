define([
    'angular',
    'lodash',
    'app'
  ],
  function (angular, _, app) {
    'use strict';

    app.directive('topicCommit', function () {

      return {
        templateUrl: " components/topics/topic-commit.html",
        controller: function ($scope) {
          $scope.removeOpt = function(opt){
            _.remove($scope.topic.opts, opt);

            _.each($scope.topic.opts, function(opt, index){
              opt.title = String.fromCharCode(index + 65);
            })
          };
          $scope.addOpt = function () {
            var _opt = {
              title: '',
              value: ''
            };

            var lastTitle = _.last($scope.topic.opts).title;

            var code = lastTitle.charCodeAt(0);
            _opt.title = String.fromCharCode(++code);
            $scope.topic.opts.push(_opt);
          };

          $scope.reset = function () {
            $scope.topic = {
              opts: [
                {title: 'A', value: ''},
                {title: 'B', value: ''}
              ],
              corrector: 5
            };
          };
          $scope.submit = function () {
            var t = $scope.topic;

            if(!t.title){
              alert("请填写题目");
              return ;
            };
            t.options = _.map(t.opts, function(opt){
              return opt.value;
            });
            if(_.compact(t.options).length < 2){
              alert("请填写至少2个选项");
              return ;
            };
            //ne(t).$save(function(){
            //  alert("题目提交成功");
            //  $scope.reset();
            //});

          };

          $scope.reset();
        },
        link: function (scope, elem, attr) {

        }
      };
    });
  });