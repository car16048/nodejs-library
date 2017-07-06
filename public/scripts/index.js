libraryApp.controller('LibraryController', ['$scope', '$location', 'BaseService', 'UserService', 'SessionService', 'SearchService', 'DataService', LibraryController]);

function LibraryController($scope, $location, BaseService, UserService, SessionService, SearchService, DataService)
{
    var self = this;
    var cur = $scope;

    var initModel = function () {
        cur.loadingVisible = false;
        cur.searchQuery = '';
        cur.searchType = 'book';
        cur.loginVisible = false;
        cur.signupVisible = false;
        cur.username = '';
        cur.password = '';
        cur.firstName = '';
        cur.lastName = '';
        cur.confirmationPassword = '';
        cur.signInError = null;
        cur.searchResults = null;
        cur.newKeyword = null;
        cur.session = BaseService.session;
    };

    var signInResponse = function (resp) {
        if (!resp || !resp.data || (!resp.data.error && (!resp.data.token || !resp.data.user))) {
            loginError = 'An unknown error has occurred';
        } else if (resp.data.error) {
            loginError = resp.data.error;
        } else {
            BaseService.setAuthToken(resp.data);
            cur.loginVisible = false;
            cur.signupVisible = false;
            $('#loginPanel').dialog('close');
            $('#signupPanel').dialog('close');
        }
    };

    cur.loginUser = function () {
        SessionService.create(cur.username, cur.password).then(signInResponse);
    };

    cur.logoutUser = function () {
        BaseService.setAuthToken(null);
        SessionService.delete();
    };

    cur.signupUser = function () {
        UserService.create(cur.username, cur.firstName, cur.lastName, cur.password).then(signInResponse);
    };

    cur.showLogin = function () {
        $('#loginPanel').dialog('open');
        cur.loginVisible = true;
    };

    cur.showSignup = function () {
        $('#signupPanel').dialog('open');
        cur.signupVisible = true;
    };

    cur.searchBooks = function () {
        $location.url('/library/searchResults/' + encodeURIComponent(cur.searchType) + '?q=' + encodeURIComponent(cur.searchQuery));
    };

    initModel();
}

$(function () {
    $('#loginPanel').dialog({modal: true, autoOpen: false});
    $('#signupPanel').dialog({width: 350, modal: true, autoOpen: false});
});