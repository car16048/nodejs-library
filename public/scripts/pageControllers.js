libraryApp.controller('AboutLibraryController', ['$scope', function ($scope) {
}]);

libraryApp.controller('AuthorDetailController', ['$scope', '$routeParams', 'DataService', 'SearchService', function ($scope, $routeParams, DataService, SearchService) {
    var self = this;
    var cur = $scope;

    cur.currentAuthor = null;
    cur.bookList = null;

    cur.getAuthor = function (id) {
        id = id || (cur.currentAuthor && cur.currentAuthor.authorid);
        DataService.readOne('author', id).then(function (resp) {
            if (!resp.data.error) {
                cur.currentAuthor = resp.data;

                SearchService.parentSearch('book', 'author', cur.currentAuthor.authorid).then(function (rsp) {
                    if (!rsp.data.error) cur.bookList = rsp.data.rows;
                });
            }
        });
    };
    cur.updateAuthor = function () {
        if (!cur.currentAuthor) return;

        DataService.update('author', cur.currentAuthor.authorid, cur.currentAuthor).then(function(resp) {
            if (resp.data.error) return cur.updateFailed();

            alert('Successfully updated the author information');
            cur.getAuthor(cur.currentAuthor.authorid);
        }, cur.updateFailed);
    };

    cur.getAuthor($routeParams.id);
}]);

libraryApp.controller('AuthorListController', ['$scope', '$routeParams', 'DataService', function ($scope, $routeParams, DataService) {
    var self = this;
    var cur = $scope;

    cur.authorList = null;
    DataService.readAll('author').then(function (data) {
        if (!data.data.error) {
            cur.authorList = data.data;
        }
    });
}]);

libraryApp.controller('BookDetailController', ['$scope', '$routeParams', 'DataService', 'SearchService', function ($scope, $routeParams, DataService, SearchService) {
    var self = this;
    var cur = $scope;

    cur.currentBook = null;
    cur.keywordList = null;
    cur.authorList = null;
    cur.publisherList = null;

    cur.removeKeyword = function (id) {
        DataService.delete('keyword', id).then(function (resp) {
            if (resp.data.error) return cur.updateFailed();
            var idx = -1;

            cur.keywordList.forEach(function (val, index) { if (val.keywordid == id) idx = index; });

            if (idx >= 0) cur.keywordList.splice(idx, 1);
        }, cur.updateFailed);
    };

    cur.addKeyword = function () {
        DataService.create('keyword', {bookid:cur.currentBook.bookid, keyword:cur.newKeyword}).then(function (resp) {
            if (resp.data.error) return cur.updateFailed();
            cur.newKeyword = '';
            cur.keywordList.push(resp.data);
        }, cur.updateFailed);
    };

    cur.getBook = function (id, refreshOtherData) {
        id = id || (cur.currentBook && cur.currentBook.bookid);
        DataService.readOne('book', id).then(function (resp) {
            if (!resp.data.error) {
                cur.currentBook = resp.data;

                if (refreshOtherData) {
                    SearchService.parentSearch('keyword', 'book', cur.currentBook.bookid).then(function (rsp) {
                        if (!rsp.data.error) cur.keywordList = rsp.data.rows;
                    });
                    DataService.readAll('author').then(function (rsp) {
                        if (!rsp.data.error) {
                            for (var i = 0; i < rsp.data.length; i++) {
                                rsp.data[i].author = rsp.data[i].firstname + ' ' + rsp.data[i].lastname;
                            }
                            cur.authorList = rsp.data;
                        }
                    });
                    DataService.readAll('publisher').then(function (rsp) {
                        if (!rsp.data.error) {
                            cur.publisherList = rsp.data;
                        }
                    });
                }
            }
        });
    };

    cur.updateBook = function () {
        if (!cur.currentBook) return;

        DataService.update('book', cur.currentBook.bookid, cur.currentBook).then(function(resp) {
            if (resp.data.error) return cur.updateFailed();

            alert('Successfully updated the book information');
            cur.getBook();
        }, cur.updateFailed);
    };

    cur.getBook($routeParams.id, true);
}]);

libraryApp.controller('BookListController', ['$scope', '$routeParams', 'DataService', function ($scope, $routeParams, DataService) {
    var self = this;
    var cur = $scope;

    cur.bookList = null;
    DataService.readAll('book').then(function (data) {
        if (!data.data.error) {
            cur.bookList = data.data;
        }
    });
}]);

libraryApp.controller('PublisherDetailController', ['$scope', '$routeParams', 'DataService', 'SearchService', function ($scope, $routeParams, DataService, SearchService) {
    var self = this;
    var cur = $scope;

    cur.currentPublisher = null;
    cur.bookList = null;

    cur.getPublisher = function (id) {
        id = id || (cur.currentPublisher && cur.currentPublisher.publisherid);
        DataService.readOne('publisher', id).then(function (resp) {
            if (!resp.data.error) {
                cur.currentPublisher = resp.data;

                SearchService.parentSearch('book', 'publisher', cur.currentPublisher.publisherid).then(function (rsp) {
                    if (!rsp.data.error) cur.bookList = rsp.data.rows;
                });
            }
        });
    }

    cur.updatePublisher = function () {
        if (!cur.currentPublisher) return;

        DataService.update('publisher', cur.currentPublisher.publisherid, cur.currentPublisher).then(function(resp) {
            if (resp.data.error) return cur.updateFailed();

            alert('Successfully updated the publisher information');
            cur.getPublisher();
        }, cur.updateFailed);
    };

    cur.getPublisher($routeParams.id);
}]);

libraryApp.controller('PublisherListController', ['$scope', '$routeParams', 'DataService', function ($scope, $routeParams, DataService) {
    var self = this;
    var cur = $scope;

    cur.publisherList = null;
    DataService.readAll('publisher').then(function (data) {
        if (!data.data.error) {
            cur.publisherList = data.data;
        }
    });
}]);

libraryApp.controller('SearchResultsController', ['$scope', '$routeParams', 'SearchService', function ($scope, $routeParams, SearchService) {
    var self = this;
    var cur = $scope;
    cur.searchResults = null;
    SearchService.bookSearch($routeParams.type, $routeParams.q, $routeParams.exact).then(function(data) {
        if (data.data.rows) {
            cur.searchResults = data.data.rows;
        }
    });
}]);

libraryApp.config(['$routeProvider', '$locationProvider',
    function ($routeProvider, $locationProvider)
    {
        $routeProvider.
        when('/library/home',  
            {
                templateUrl: '/pages/aboutLibrary.html',
                controller: 'AboutLibraryController'
            })
            .
        when('/library/authorDetail/:id',
            {
                templateUrl: '/pages/authorDetail.html',
                controller: 'AuthorDetailController'
            })
            .
        when('/library/authorList',
            {
                templateUrl: '/pages/authorList.html',
                controller: 'AuthorListController'
            })
            .
        when('/library/bookDetail/:id',
            {
                templateUrl: '/pages/bookDetail.html',
                controller: 'BookDetailController'
            })
            .
        when('/library/bookList',
            {
                templateUrl: '/pages/bookList.html',
                controller: 'BookListController'
            })
            .
        when('/library/publisherDetail/:id',
            {
                templateUrl: '/pages/publisherDetail.html',
                controller: 'PublisherDetailController'
            })
            .
        when('/library/publisherList',
            {
                templateUrl: '/pages/publisherList.html',
                controller: 'PublisherListController'
            })
            .
        when('/library/searchResults/:type',
            {
                templateUrl: '/pages/searchResults.html',
                controller: 'SearchResultsController'
            })
            .
        otherwise(
        {
            redirectTo: '/library/home'
        });

        $locationProvider.html5Mode(true);
    }
]);
