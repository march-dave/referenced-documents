'use strict';

var app = angular.module('friendApp', ['ui.router']);

app.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('userList', {
      url: '/list',
      templateUrl: '/html/list.html',
      controller: 'listCtrl'
    })
    .state('detail', {
      url: '/detail/:userId',
      templateUrl: '/html/detail.html',
      controller: 'detailCtrl'
    })

  $urlRouterProvider.otherwise('/list');
});

app.controller('listCtrl', function($scope, User) {
  User.getAll()
    .then(res => {
      $scope.users = res.data;
    });
});

app.controller('detailCtrl', function($scope, $state, User) {
  User.getById($state.params.userId)
    .then(res => {
      $scope.user = res.data;
      return User.getPotential($state.params.userId);
    })
    .then(res => {
      $scope.potential = res.data;
    })

  $scope.removeFriend = friend => {
    User.unfriend($scope.user._id, friend._id)
      .then(res => {

        var index = $scope.user.friends.indexOf(friend);
        $scope.user.friends.splice(index, 1);
        $scope.potential.push(friend);

      });
  };

  $scope.addFriend = () => {
    // console.log('$scope.selectedFriend._id:', typeof $scope.selectedFriend)
    var friend = JSON.parse($scope.selectedFriend)

    User.addFriend($scope.user._id, friend._id)
      .then(res => {
        var index = $scope.potential.indexOf(friend);
        $scope.potential.splice(index, 1);
        $scope.user.friends.push(friend);
      });
  }
});

app.service('User', function($http) {

  this.getAll = () => {
    return $http.get('/api/users');
  };

  this.getById = userId => {
    return $http.get(`/api/users/${userId}`)
  };

  this.addFriend = (user1Id, user2Id) => {
    return $http.put(`/api/users/${user1Id}/addFriend/${user2Id}`);
  };

  this.unfriend = (user1Id, user2Id) => {
    return $http.put(`/api/users/${user1Id}/removeFriend/${user2Id}`);
  };

  this.getPotential = userId => {
    return $http.get(`/api/users/${userId}/potential`);
  }
});
