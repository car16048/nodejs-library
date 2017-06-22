libraryApp.controller('AboutLibraryController', ['$scope', function ($scope) {
}]);

libraryApp.controller('AuthorDetailController', ['$scope', '$routeParams', 'DataService', 'SearchService', function ($scope, $routeParams, DataService, SearchService) {
    var self = this;
    var cur = $scope;

    cur.currentAuthor = null;
    cur.bookList = null;
    DataService.readOne('author', $routeParams.id).then(function (data) {
        if (!data.data.error) {
            cur.currentAuthor = data.data;

            SearchService.parentSearch('book', 'author', cur.currentAuthor.authorid).then(function (data) {
                if (!data.data.error) cur.bookList = data.data.rows;
            });
        }
    });
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
    DataService.readOne('book', $routeParams.id).then(function (data) {
        if (!data.data.error) {
            cur.currentBook = data.data;
            SearchService.parentSearch('keyword', 'book', cur.currentBook.bookid).then(function (data) {
                if (!data.data.error) cur.keywordList = data.data.rows;
            });
        }
    });
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
    DataService.readOne('publisher', $routeParams.id).then(function (data) {
        if (!data.data.error) {
            cur.currentPublisher = data.data;

            SearchService.parentSearch('book', 'publisher', cur.currentPublisher.publisherid).then(function (data) {
                if (!data.data.error) cur.bookList = data.data.rows;
            });
        }
    });
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
