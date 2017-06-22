var libraryApp = angular.module('libraryApp', ['ngRoute']);

libraryApp.factory('BaseService', ['$q', '$http', function ($q, $http) {
    var self = {};

    self.sid = null;
    self.getHeaders = function () { return self.sid ? {headers:{Cookie:'SID=' + self.sid}} : null; };
    self.get = function (url) { return $http.get('/api/' + url, self.getHeaders()); };
    self.post = function (url, data) { return $http.post('/api/' + url, data, self.getHeaders()); };
    self.put = function (url, data) { return $http.put('/api/' + url, data, self.getHeaders()); };
    self.delete = function (url) { return $http.delete('/api/' + url, self.getHeaders()); };

    return self;
}]);

libraryApp.factory('UserService', ['BaseService',
    function (BaseService) {
        var self = {};
        var apiUrl = 'user';

        self.read = function () {
            return BaseService.get(apiUrl);
        };

        self.create = function (logonName, firstName, lastName, password) {
            return BaseService.post(apiUrl, {logonname:logonName, firstname: firstName, lastname:lastName, password:password});
        };

        self.update = function (logonName, firstName, lastName, password) {
            return BaseService.put(apiUrl, {logonname:logonName, firstname: firstName, lastname:lastName, password:password});
        };

        return self;
    }]);

libraryApp.factory('SessionService', ['BaseService',
    function (BaseService) {
        var self = {};
        var apiUrl = 'session';

        self.create = function (logonName, password) {
            return BaseService.post(apiUrl, {logonname:logonName, password:password});
        };

        self.delete = function () {
            return BaseService.delete(apiUrl);
        };

        return self;
    }]);

libraryApp.factory('SearchService', ['BaseService',
    function (BaseService) {
        var self = {};
        var apiUrl = 'search/';

        self.parentSearch = function (dataType, parentType, parentId) {
            return BaseService.post(apiUrl + dataType, {by:parentType, id:parentId});
        };

        self.bookSearch = function (dataType, query, exactSearch) {
            return BaseService.post(apiUrl + dataType, {query:query, exactSearch:(exactSearch == true)});
        };

        return self;
    }]);

libraryApp.factory('DataService', ['BaseService',
    function (BaseService) {
        var self = {};

        self.readAll = function (dataType) {
            return BaseService.get(dataType);
        };

        self.readOne = function (dataType, id) {
            return BaseService.get(dataType + '/' + parseInt(id));
        };

        self.create = function (dataType, dataObject) {
            return BaseService.post(dataType, dataObject);
        };

        self.update = function (dataType, dataObject) {
            return BaseService.put(dataType, dataObject);
        };

        self.delete = function (dataType, id) {
            return BaseService.delete(dataType + '/' + parseInt(id));
        };

        return self;
    }]);

