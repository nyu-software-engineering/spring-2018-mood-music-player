var app = angular.module('smoodifyApp', ['ngRoute', 'ngResource', 'angularCSS']).run(function($rootScope, $http) {
	$rootScope.authenticated = false;
	$rootScope.current_user = '';
	
	$rootScope.signout = function(){
    	$http.get('auth/signout');
    	$rootScope.authenticated = false;
    	$rootScope.current_user = '';
	};
});

app.config(function($routeProvider){
	$routeProvider
		// the landing display
		.when('/', {
			css: {
				href: '../stylesheets/login.css',
				preload: true
			},
			templateUrl: 'landing.html',
			controller: 'mainController'
		})
		// the login display
		.when('/login', {
			css: {
				href: '../stylesheets/login.css',
				preload: true
			},
			templateUrl: 'login.html',
			controller: 'authController'
		})
		// the signup display
		.when('/register', {
			css: {
				href: '../stylesheets/login.css',
				preload: true
			},
			templateUrl: 'register.html',
			controller: 'authController',
		})
		// the logged in display
		.when('/browse', {
			css: {
				href: '../stylesheets/base.css',
				preload: true
			},
			templateUrl: 'main.html',
			controller: 'mainController'
		}).when('/spotify_login', {
			css: {
				/* Code to get to Spotify Login */
			},
			templateUrl: 'main.html',
			controller: 'spotifyController'
		});
});

app.factory('songService', function($resource) {
	return $resource ('api/songs');
});

app.controller('mainController', function(songService, $scope, $rootScope){
	$scope.songs = songService.query();

	$scope.post = function() {
	  $scope.newSong.title = $scope.new.title;
	  $scope.newSong.artist = $scope.new.artist;
	  songService.save($scope.newSong, function(){
	    $scope.songs = songService.query();
	    $scope.newSong = {title: '', artist: ''};
	  });
	};
});

/* controller for spotify login */
app.controller('spotifyController', function($scope, $http, $location, $window) {
	$scope.scopes = 'user-read-private user-read-email';
	/* Currently giving a CORS issue because Spotify doesn't allow Cross Domain Access */
	/* TODO: Create a proxy server to be able to Cross Domain Access */
	$http.get('"https://cors-escape.herokuapp.com/https://accounts.spotify.com/authorize' +
      '?response_type=code' +
      '&client_id=' + 'dcddb8d13b2f4019a1dadb4b4c070661' +
      ($scope.scopes ? '&scope=' + encodeURIComponent($scope.scopes) : '') +
			'&redirect_uri=' + encodeURIComponent('http://localhost:3000'))
			.then(function(response) {
				$scope.my_data = response.data;
	});
});



app.controller('authController', function($scope, $http, $rootScope, $location){
  $scope.user = {username: '', password: ''};
  $scope.error_message = '';
  $scope.login = function(){
    $http.post('/auth/login', $scope.user).success(function(data){
      if(data.state == 'success'){
        $rootScope.authenticated = true;
        $rootScope.current_user = data.user.username;
        $location.path('/browse');
      }
      else{
        $scope.error_message = data.message;
      }
    });
  };

  $scope.register = function(){
    $http.post('/auth/signup', $scope.user).success(function(data){
      if(data.state == 'success'){
        $rootScope.authenticated = true;
        $rootScope.current_user = data.user.username;
        $location.path('/browse');
      }
      else{
        $scope.error_message = data.message;
      }
    });
  };
});