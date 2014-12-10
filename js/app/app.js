angular.module( 'CommentApp', [ 
    'CommentApp.services',
    'ngMaterial', 
    'firebase'
])

.controller('LeftCtrl', function($scope, $timeout, $mdSidenav, User, $rootScope) {
    $scope.user = User;
    $scope.isLogged = User.isLogged();

    $scope.$on('loggedIn', function() {
        $scope.isLogged = User.isLogged();
        $scope.$apply();
    });

    $scope.close = function() {
        $mdSidenav('left').close();
    };
})

.controller('GridBottomSheetCtrl', function($scope, $mdBottomSheet) {
  $scope.items = [
    { name: 'Comment', icon: 'comments' },
    { name: 'Like', icon: 'thumbs-up' },
    { name: 'Dislike', icon: 'thumbs-down' },
    { name: 'Facebook', icon: 'facebook-square' },
    { name: 'Twitter', icon: 'twitter-square' },
  ];
  $scope.listItemClick = function($index) {
    var clickedItem = $scope.items[$index];
    $mdBottomSheet.hide(clickedItem);
  };
})

.controller('DialogCtrl', function($scope, $mdDialog, Message, User) {
    $scope.message = Message.message;
    $scope.comment = {
        what: '',
        notes: '',
        who: User.auth.facebook.cachedUserProfile.name,
        when: new Date(),
        face: User.auth.facebook.cachedUserProfile.picture.data.url,
        like: 0,
        dislike: 0,
    };
    $scope.hide = function() {
        $mdDialog.hide();
    };
    $scope.cancel = function() {
        $mdDialog.cancel();
    };
    $scope.answer = function() {
        console.log($scope.comment);
        if ($scope.comment.what == '' || $scope.comment.notes == '') {
            alert('comment can\'t be blank');
        } else if ($scope.message.indexOf($scope.comment.what) == -1) {
            alert('comment word must exist in the previous comment');
        } else {
            $mdDialog.hide($scope.comment);
        }
    };
})

.controller('HomeCtrl', function($scope, $mdSidenav, $timeout, $mdBottomSheet, $mdDialog, Comments, Message, User) {
    $scope.comments = Comments;
    var compare = function(a, b) {
        if ($scope.sorting == 1) {
            return a.$id < b.$id;
        } else if ($scope.sorting == 2) {
            return a.like > b.like;
        } else {
            return a.dislike > b.dislike;
        }
    };
    $scope.comments.sort(compare);
    $scope.comments.$watch(function() { $scope.comments.sort(compare); });
    $scope.user = User;
    $scope.active = 0;
    $scope.sorting = 1;
    $scope.openLeftMenu = function() {
        $mdSidenav('left').toggle();
    };
    $scope.login = function() {
        User.login();
    }
    $scope.logout = function() {
        User.logout();
    }
    $scope.sort = function() {
        $scope.sorting ++;
        if ($scope.sorting > 3) 
            $scope.sorting = 1;
        $scope.comments.sort(compare);
    }
    $scope.showGridBottomSheet = function($event, item) {
        if (!User.isLogged()) {
            alert('Please login first!');
            $mdSidenav('left').toggle();
        } else {
            $scope.active = item;
            $mdBottomSheet.show({
                templateUrl: 'partials/bottom-sheet.html',
                controller: 'GridBottomSheetCtrl',
                targetEvent: $event
            }).then(function(clickedItem) {
                var id = $scope.comments.$indexFor($scope.active);
                $scope.comment = $scope.comments[id];
                switch (clickedItem.name) {
                    case 'Comment': 
                        $scope.showAdvanced($scope.comment);
                        break;
                    case 'Like':
                        $scope.comment.like++;
                        $scope.comments.$save($scope.comment);
                        break;
                    case 'Dislike':
                        $scope.comment.dislike++;
                        $scope.comments.$save($scope.comment);
                        break;
                    case 'Facebook':
                        alert('coming soon');
                        break;
                    case 'Twitter':
                        alert('coming soon');
                        break;
                }
            });
        }
    };
    $scope.showAdvanced = function(item) {
        Message.message = item.notes;
        $mdDialog.show({
            controller: 'DialogCtrl',
            templateUrl: 'partials/dialog.html',
        })
        .then(function(comment) {
            $scope.comments.$add(comment);
        });
    };
})