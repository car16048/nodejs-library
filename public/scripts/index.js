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
        cur.loginError = null;
        cur.signupError = null;
        cur.searchResults = null;
        cur.newKeyword = null;
        cur.user = null;
    };

    cur.loginUser = function () {
        SessionService.create(cur.username, cur.password).then(function(data) {
            if (data.data.error) {
                loginError = data.data.error;
            } else if (!data.data.sid || !data.data.user) {
                loginError = 'An unknown error has occurred';
            } else {
                BaseService.sid = data.data.sid;
                cur.user = data.data.user;
                cur.loginVisible = false;
            }
        });
    };

    cur.logoutUser = function () {
        SessionService.delete().then(function() { cur.user = null; BaseService.sid = null; });
    };

    cur.signupUser = function () {
        UserService.create(cur.username, cur.firstName, cur.lastName, cur.password).then(function(data) {
            if (data.data.error) {
                signupError = data.data.error;
            } else if (!data.data.sid || !data.data.user) {
                signupError = 'An unknown error has occurred';
            } else {
                BaseService.sid = data.data.sid;
                cur.user = data.data.user;
                cur.loginVisible = false;
            }
        });
    };

    cur.showLogin = function () {
        $('#loginPanel').dialog({modal: true});
        cur.loginVisible = true;
    };

    cur.showSignup = function () {
        $('#signupPanel').dialog({width: 350, modal: true});
        cur.signupVisible = true;
    };

    cur.searchBooks = function () {
        $location.url('/library/searchResults/' + encodeURIComponent(cur.searchType) + '?q=' + encodeURIComponent(cur.searchQuery));
    };

    cur.searchByKeyword = function (keyword) {
        cur.searchResults = null;
        setCurrentScreen('searchResults');
        cur.loadingVisible = true;
        SearchService.bookSearch('keyword', keyword, true).then(function(data) {
            if (data.data.rows) {
                cur.searchResults = data.data.rows;
            }
        }).finally(function() { cur.loadingVisible = false; });
    };

    cur.removeKeyword = function (id) {
        DataService.delete('keyword', id).then(function () {
            var idx = -1;

            keywordList.forEach(function (val, index) { if (val.keywordid == id) idx = index; });

            if (idx >= 0) keywordList.splice(idx, 1);
        });
    };

    cur.addKeyword = function () {
        DataService.create('keyword', {bookid:cur.currentBook.bookid, keyword:cur.newKeyword}).then(function (data) {
            keywordList.push(data.data);
        });
    };

    cur.showAbout = function () {
        setCurrentScreen('aboutLibrary');
    };

    cur.showBook = function (id) {
        cur.currentBook = null;
        setCurrentScreen('bookDetail')
        cur.loadingVisible = true;
        DataService.readOne('book', id).then(function (data) {
            if (!data.data.error) {
                cur.currentBook = data.data;
            }
        }).finally(function() { cur.loadingVisible = false; });
    };

    cur.showAuthor = function (id) {
        cur.currentAuthor = null;
        cur.bookList = null;
        setCurrentScreen('authorDetail')
        cur.loadingVisible = true;
        DataService.readOne('author', id).then(function (data) {
            if (!data.data.error) {
                cur.currentAuthor = data.data;
                SearchService.parentSearch('book', 'author', cur.currentAuthor.authorid).then(function (searchData) {
                    if (!searchData.data.error) {
                        cur.bookList = searchData.data.rows;
                    }
                });
            }
        }).finally(function() { cur.loadingVisible = false; });
    };

    cur.showPublisher = function (id) {
        cur.currentPublisher = null;
        cur.bookList = null;
        setCurrentScreen('publisherDetail')
        cur.loadingVisible = true;
        DataService.readOne('publisher', id).then(function (data) {
            if (!data.data.error) {
                cur.currentPublisher = data.data;
                SearchService.parentSearch('book', 'publisher', cur.currentPublisher.publisherid).then(function (searchData) {
                    if (!searchData.data.error) {
                        cur.bookList = searchData.data.rows;
                    }
                });
            }
        }).finally(function() { cur.loadingVisible = false; });
    };

    cur.showBooks = function () {
        cur.bookList = null;
        setCurrentScreen('bookList');
        cur.loadingVisible = true;
        DataService.readAll('book').then(function (data) {
            if (!data.data.error) {
                cur.bookList = data.data;
            }
        }).finally(function() { cur.loadingVisible = false; });
    };

    cur.showAuthors = function () {
        cur.authorList = null;
        setCurrentScreen('authorList')
        cur.loadingVisible = true;
        DataService.readAll('author').then(function (data) {
            if (!data.data.error) {
                cur.authorList = data.data;
            }
        }).finally(function() { cur.loadingVisible = false; });
    };

    cur.showPublishers = function () {
        cur.publisherList = null;
        setCurrentScreen('publisherList')
        cur.loadingVisible = true;
        DataService.readAll('publisher').then(function (data) {
            if (!data.data.error) {
                cur.publisherList = data.data;
            }
        }).finally(function() { cur.loadingVisible = false; });
    };

    initModel();
}

$(function () {

});