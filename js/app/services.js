angular.module('CommentApp.services', [])

.value('fbURL', 'https://thecomment.firebaseio.com/')

.factory('Comments', function($firebase, fbURL) {
    var ref = new Firebase(fbURL + 'comments');
    return $firebase(ref).$asArray();
})


.service('User', function($firebase, fbURL, $rootScope) {
    var self = this;
    var ref = new Firebase(fbURL);
    self.auth = {};
    self.login = function() {
        ref.authWithOAuthPopup("facebook", function(error, authData) { 
            self.auth = authData;
            console.log(authData);
            $rootScope.$broadcast('loggedIn');
        });    
    }
    self.getAuth = function() {
        return self.auth;
    }
    self.isLogged = function() {
        return !_.isEmpty(self.auth);
    }
    self.logout = function() {
        self.auth = {};
        ref.unauth();
        $rootScope.$broadcast('loggedIn');
    }
})

.service('Message', function() {
    var self = this;
    self.message = '';
    return self;
})