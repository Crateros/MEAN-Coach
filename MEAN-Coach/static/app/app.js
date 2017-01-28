angular.module('App', ['ui.router'])
.config([
  '$stateProvider',
  '$urlRouterProvider',
  '$locationProvider',
  function(
    $stateProvider,
    $urlRouterProvider,
    $locationProvider
  ) {
    $urlRouterProvider.otherwise('/');

//Setup states (routes)
$stateProvider
.state('homeState', {
  url: '/',
  component: 'homeComp'
})
.state('signupState', {
  url: '/signup',
  component: 'signupComp'
})
.state('loginState', {
  url: '/login/:id',
  component: 'login'
})
.state('profileState', {
  url: '/profile/:id',
  component: 'profileComp'
});

//Removes # symbol for our routes
$locationProvider.html5Mode(true);
