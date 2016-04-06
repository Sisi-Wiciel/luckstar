require('./navbar.css');

module.exports = ['$scope', '$location', 'authSrv', 'navbarSrv', function($scope, $location, authSrv, navbarSrv) {
  $scope.menu = navbarSrv.menu;

  $scope.user = authSrv.getCurrentUser();

  $scope.isCollapsed = true;

  $scope.logout = function() {
    authSrv.logout();
    $location.path('/');
  };

  $scope.goto = function(item) {
    $location.path(item.link);
  };

  $scope.isActive = function(route) {
    return route === $location.path();
  };
}];
