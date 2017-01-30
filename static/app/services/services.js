angular.module('App')

//POST new user to database, utilize Auth factory
.factory('UserService', ['$http', 'Auth', function($http, Auth) {
  return {
    createAccount: function(params) {
      var URL = '/api/users';
      var req = {
        url: URL,
        method: "POST",
        data: params
      };
      return $http(req).then(function(res) {
        if(res.status !== 200) {
          console.log("Couldn't create user");
          return false;
        }
        console.log("User create response: ", res.data);
        return res.data;
      }, function error(res) {
        console.log("Error response: ", res);
      });
    },
    login: function(params) {
      var req = {
        url: '/api/auth',
        method: 'POST',
        data: params
    };
      console.log(req);
      return $http(req).then(function(res) {
        console.log("Got network", res);
        // return res.data;
        Auth.saveToken(res.data.token);
        console.log("logged in?", Auth.isLoggedIn())
        return res.data.user;
      });
    }
  };
}])

//Authenicate user via token
.factory('Auth', ['$window', function($window) {
  return {
    saveToken: function(token) {
      $window.localStorage['mean-user-token'] = token;
      console.log("token has been saved: ", token);
    },
    getToken: function() {
      return $window.localStorage['mean-user-token'];
    },
    removeToken: function() {
      $window.localStorage.removeItem('mean-user-token');
    },
    isLoggedIn: function() {
      var token = this.getToken();
      if (token) {
        console.log("logged in", token);
        return true;
      } else {
        console.log("not logged in", token);
        return false;
      }
    },
    currentUser: function() {
      if (this.isLoggedIn()) {
        var token = this.getToken();
        try {
          var payload = JSON.parse($window.atob(token.split('.')[1]));
          return payload;
        } catch(err) {
          return false;
        }
      }
    }
  };
}])

//Token interception over AJAX. Configures the header of the request to include authorization
.factory('AuthInterceptor', ['Auth', function(Auth) {
  return {
    request: function(config) {
      var token = Auth.getToken();
      if (token) {
        config.headers.Authorization = 'Bearer ' + token;
      }
      return config;
    }
  };
}]);