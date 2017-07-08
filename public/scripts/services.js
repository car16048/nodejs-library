var libraryApp = angular.module('libraryApp', ['ngRoute']);

libraryApp.factory('BaseService', ['$q', '$http', function ($q, $http) {
    var self = {};
    const sessionKey = 'BaseService-Session';

    self.session = {token:undefined, user:undefined};

    if (window.sessionStorage && sessionStorage.getItem(sessionKey)) {
        var session = JSON.parse(sessionStorage.getItem(sessionKey));

        if (session && session.token && session.user) {
            self.session.token = session.token;
            self.session.user = session.user;
        }
    }

    self.setAuthToken = function (data) {
        self.session.token = data && data.user && data.token;
        self.session.user = data && data.token && data.user;

        if (window.sessionStorage) {
            if (data && data.token && data.user) {
                sessionStorage.setItem(sessionKey, JSON.stringify(self.session));
            } else {
                sessionStorage.removeItem(sessionKey);
            }
        }
    };
    self.refresh = function (resp) {
        if (resp && typeof(resp.headers) === 'function') {
            if (resp.headers('X-Reauth')) {
                self.setAuthToken(null);
            } else if (resp.headers('X-Auth-Refresh')) {
                self.session.token = resp.headers('X-Auth-Refresh');
                self.setAuthToken(self.session);
            }
        }

        return resp;
    };
    self.getHeaders = function () { return self.session.token ? {headers:{Authorization:'Bearer ' + self.session.token}} : null; };
    self.get = function (url) { return $http.get('/api/' + url, self.getHeaders()).then(self.refresh); };
    self.post = function (url, data) { return $http.post('/api/' + url, data, self.getHeaders()).then(self.refresh); };
    self.put = function (url, data) { return $http.put('/api/' + url, data, self.getHeaders()).then(self.refresh); };
    self.delete = function (url) { return $http.delete('/api/' + url, self.getHeaders()).then(self.refresh); };

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

        self.update = function (dataType, id, dataObject) {
            return BaseService.put(dataType + '/' + id, dataObject);
        };

        self.delete = function (dataType, id) {
            return BaseService.delete(dataType + '/' + parseInt(id));
        };

        return self;
    }]);

