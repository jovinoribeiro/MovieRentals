var app = angular.module('MovieRentals', ['ngResource', 'ngRoute', 'ui.router']);

app.config(['$routeProvider', '$stateProvider', function($routeProvider, $stateProvider) {
	$routeProvider
		.when('/', {
			templateUrl: 'partials/home.html',
			controller: 'HomeCtrl'
		})
		.when('/add-video', {
			templateUrl: 'partials/video-form.html',
			controller: 'AddVideoCtrl'
		})
		.when('/edit-video/:id', {
			templateUrl: 'partials/video-form.html',
			controller: 'EditVideoCtrl'
		})
		.when('/delete-video/:id', {
			templateUrl: 'partials/delete-video.html',
			controller: 'DeleteVideoCtrl'
		})
		.when('/login', {
			templateUrl: '/login.html',
			controller: 'AuthCtrl'
		})
		.when('/register', {
			templateUrl: '/register.html',
			controller: 'AuthCtrl'
		})
		.otherwise( {			
			redirectTo: '/'
		});

	$stateProvider
	.state('home', {
      url: '/',
      templateUrl: 'partials/home.html',
	  controller: 'HomeCtrl'
    })
	.state('login', {
	  url: '/login',
	  templateUrl: '/login.html',
	  controller: 'AuthCtrl',
	  onEnter: ['$state', 'auth', function($state, auth){
	  	if(auth.isLoggedIn()){
	      $state.go('home');
	    }
	  }]
	})
	.state('register', {
	  url: '/register',
	  templateUrl: '/register.html',
	  controller: 'AuthCtrl',
	  onEnter: ['$state', 'auth', function($state, auth){
	    if(auth.isLoggedIn()){
	      $state.go('home');
	    }
	  }]
	});	
	}]);

app.controller('HomeCtrl', ['$scope', '$resource', function($scope, $resource) {
		var Videos = $resource('/api/videos');
		Videos.query(function(videos) {
			$scope.videos = videos;
		});
	}
]);
 
app.controller('AddVideoCtrl', ['$scope', '$resource', '$location',
	function($scope, $resource, $location) {
		
		$scope.save = function() {
			var Videos = $resource('/api/videos');
			Videos.save($scope.video, function() {
				$location.path('/');
			});
		};
	}]);

app.controller('EditVideoCtrl', ['$scope', '$resource', '$location', '$routeParams',
	function($scope, $resource, $location, $routeParams) {

		var Videos = $resource('/api/videos/:id', { id: '@_id'}, {
			update: { method: 'PUT' }
		});

		Videos.get( { id: $routeParams.id }, function(video) {
			$scope.video = video;
		});

		$scope.save = function() {
			Videos.update($scope.video, function() {
				$location.path('/');
			});
		}
}]);

app.controller('DeleteVideoCtrl', ['$scope', '$resource', '$location', '$routeParams',
	function($scope, $resource, $location, $routeParams) {

		var Videos = $resource('/api/videos/:id');

		Videos.get( { id: $routeParams.id }, function(video) {
			$scope.video = video;	
		});

		$scope.delete = function() {
			Videos.delete( { id: $routeParams.id }, function(video) {
				$location.path('/');	
			});
		};
}]);

app.factory('auth', ['$http', '$window', function($http, $window) {
	var auth = {};

	auth.saveToken = function(token) {
		$window.localStorage['videos-token'] = token;
	};

	auth.getToken = function() {
		return $window.localStorage['videos-token'];
	};

	auth.isLoggedIn = function() {
		var token = auth.getToken();

		if (token) {
			var payload = JSON.parse($window.atob(token.split('.')[1]));
			return payload.exp > Date.now() / 1000;
		} else {
			return false;
		}
	};

	auth.currentUser = function(){
	  if(auth.isLoggedIn()){
	    var token = auth.getToken();
	    var payload = JSON.parse($window.atob(token.split('.')[1]));

	    return payload.username;
	  }
	};

	auth.register = function(user){
	  return $http.post('/register', user).success(function(data){
	    auth.saveToken(data.token);
	  });
	};

	auth.logIn = function(user){
	  return $http.post('/login', user).success(function(data){
	    auth.saveToken(data.token);
	  });
	};

	auth.logOut = function(){
	  $window.localStorage.removeItem('videos-token');
	};

	return auth;
}]);

app.controller('AuthCtrl', [
'$scope',
'$state',
'auth',
function($scope, $state, auth){
  $scope.user = {};

  $scope.register = function(){
    auth.register($scope.user).error(function(error){
    	alert(JSON.stringify(error));
      $scope.error = error;
    }).then(function(){
      $state.go('home');
    });
  };

  $scope.logIn = function(){
    auth.logIn($scope.user).error(function(error){
    	alert(JSON.stringify(error));
      $scope.error = error;
    }).then(function(){
      $state.go('home');
    });
  };
}]);

app.controller('NavCtrl', [
'$scope',
'auth',
function($scope, auth){
  $scope.isLoggedIn = auth.isLoggedIn;
  $scope.currentUser = auth.currentUser;
  $scope.logOut = auth.logOut;
}]);