require('./navbar.less');

module.exports = navbarCtrl;

/* @ngInject */
function navbarCtrl($scope, authSrv, navbarSrv, $location) {
  $scope.menu = navbarSrv.menu;

  $scope.user = authSrv.getCurrentUser();
  $scope.logout = function() {
    authSrv.logout();
    $scope.goto('/');
  };

  $scope.isActive = function(item) {
    return item.link === $location.path();
  };
}
