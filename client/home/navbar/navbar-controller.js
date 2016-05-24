require('./navbar.css');

module.exports = ['$scope', 'authSrv', 'navbarSrv', '$location', function($scope, authSrv, navbarSrv, $location) {
  $scope.menu = navbarSrv.menu;

  $scope.user = authSrv.getCurrentUser();
  $scope.leftNavIsOpen = $scope.bigScreen;
  $scope.logout = function() {
    authSrv.logout();
    $scope.goto('/');
  };

  $scope.isActive = function(item) {
    return item.link === $location.path();
  };
}];
